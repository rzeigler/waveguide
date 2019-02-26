import { boundMethod } from "autobind-decorator";
import { array } from "fp-ts/lib/Array";
import { Either, left, right } from "fp-ts/lib/Either";
import { Abort, Cause, Raise } from "./cause";
import { ForwardProxy } from "./forwardproxy";
import { caused, IO, of, suspend, sync, syntax } from "./io";
import { Caused } from "./iostep";
import { OneShot } from "./oneshot";
import { Completed, Failed, Interrupted, interrupted, Result } from "./result";

export type Frame = ChainFrame | ErrorFrame | FinalizeFrame;

export interface Call {
  /**
   * Encodes the normal invocation of the call stack where a value is received
   * and the continuation must be processed
   */
  apply(a: unknown): IO<unknown, unknown>;
}

export class ChainFrame implements Call {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly f: (a: unknown) => IO<unknown, unknown>) { }
  /**
   * Invoke the chain method
   */
  public apply(a: unknown): IO<unknown, unknown> {
    return this.f(a);
  }
}

export class ErrorFrame implements Call {
  public readonly _tag: "error" = "error";
  constructor(public readonly f: (cause: Cause<unknown>) => IO<unknown, unknown>) { }
  /**
   * Normal processing of error frames means pass the value through directly
   */
  public apply(a: unknown): IO<unknown, unknown> {
    return syntax<unknown>().of(a);
  }
}

/* I find this type deeply confusing, apologies. Basically, we are encoding an async boundary link.
 * In order to cross an async boundary we need a function (cont) that is able to receive an async callback
 * ((Either => void) => (() => void))
 * which is responsible for doing the linking
 */
type AsyncHop = (continuation: (callback: (result: Either<Cause<unknown>, unknown>) => void) => (() => void)) => void;

class AsyncFrame {
  private proxy: ForwardProxy;
  private interrupted: boolean;
  private continuation: (callback: (result: Either<Cause<unknown>, unknown>) => void) => () => void;
  constructor(continuation: (callback: (result: Either<Cause<unknown>, unknown>) => void) => () => void) {
    this.proxy = new ForwardProxy();
    this.interrupted = false;
    this.continuation = continuation;
  }
  public go(callback: (result: Either<Cause<unknown>, unknown>) => void): void {
    const adapted = (result: Either<Cause<unknown>, unknown>) => {
      if (!this.interrupted) {
        // Set interrupted after first call through to defend against buggy async
        this.interrupted = true;
        callback(result);
      }
    };
    this.proxy.fill(this.continuation(adapted));
  }
  public interrupt(): void {
    this.interrupted = true;
    this.proxy.invoke();
  }
}

export class FinalizeFrame implements Call {
  public readonly _tag: "finalize" = "finalize";
  constructor(public readonly io: IO<unknown, unknown>) { }
  /**
   * Normal processing of finalize frames means invoke the finalizer and then
   * return the the value
   */
  public apply(a: unknown): IO<unknown, unknown> {
    return this.io.as(a);
  }
}

export class Runtime<E, A> {
  public readonly result: OneShot<Result<E, A>> = new OneShot();

  private started: boolean = false;

  private asyncFrame: AsyncFrame | undefined;
  private readonly callFrames: Frame[] = [];
  private criticalSections: number = 0;

  private interrupted: boolean = false;

  private enterCritical: IO<unknown, unknown> = sync(() => {
    this.criticalSections++;
  });

  private leaveCritical: IO<unknown, unknown> = sync(() => {
    this.criticalSections--;
  });

  public start(io: IO<E, A>): void {
    if (this.started) {
      throw new Error("Bug: Runtime may not be started more than once");
    }
    this.started = true;
    this.loopResume(io as IO<unknown, unknown>);
  }

  public interrupt(): void {
    if (!this.result.isSet() && !this.interrupted) {
      this.interrupted = true;
      if (this.criticalSections === 0) {
        this.asyncFrame!.interrupt();
        this.interruptFinalize();
      }
    }
  }

  @boundMethod
  private loopResume(next: IO<unknown, unknown>): void {
    this.loop(next, this.loopResume);
  }

  @boundMethod
  private interruptLoopResume(next: IO<unknown, unknown>): void {
    this.interruptLoop(next, this.interruptLoopResume);
  }

  @boundMethod
  private loop(io: IO<unknown, unknown>, resume: (next: IO<unknown, unknown>) => void): void {
    let current: IO<unknown, unknown> | undefined = io;
    while (current && (!this.interrupted || this.criticalSections > 0)) {
      current = this.step(current, resume, this.complete);
    }
    // We were interrupted, so switch to the interrupt loop
    if (current) {
      this.interruptFinalize();
    }
  }

  @boundMethod
  private interruptFinalize(): void {
    const finalize = this.unwindInterrupt();
    if (finalize) {
      this.interruptLoopResume(finalize);
    } else {
      this.result.set(interrupted);
    }
  }

  @boundMethod
  private interruptLoop(io: IO<unknown, unknown>, resume: (next: IO<unknown, unknown>) => void): void {
    let current: IO<unknown, unknown> | undefined = io;
    while (current) {
      current = this.step(current, resume, this.interruptComplete);
    }
  }

  @boundMethod
  private complete(result: Either<Cause<unknown>, unknown>): void {
    this.result.set(result.fold<Result<unknown, unknown>>(Failed.create, Completed.create) as Result<E, A>);
  }

  @boundMethod
  private interruptComplete(_: Either<Cause<unknown>, unknown>): void {
    this.result.set(interrupted);
  }

  private step(current: IO<unknown, unknown>,
               resume: (next: IO<unknown, unknown>) => void,
               complete: (result: Either<Cause<unknown>, unknown>) => void): IO<unknown, unknown> | undefined {
    if (current.step._tag === "of") {
      return this.popFrame(current.step.value, complete);
    } else if (current.step._tag === "failed") {
      return this.unwindError(new Raise(current.step.error), complete);
    } else if (current.step._tag === "raised") {
      return this.unwindError(current.step.raise, complete);
    } else if (current.step._tag === "suspend") {
      try {
        return current.step.thunk();
      } catch (e) {
        return new IO(new Caused(new Abort(e)));
      }
    } else if (current.step._tag === "async") {
      this.contextSwitch(current.step.start, resume, complete);
      return;
    } else if (current.step._tag === "critical") {
      this.criticalSections++;
      return current.step.io.ensuring(this.leaveCritical);
    } else if (current.step._tag === "chain") {
      this.callFrames.push(new ChainFrame(current.step.chain));
      return current.step.left;
    } else if (current.step._tag === "chainerror") {
      this.callFrames.push(new ErrorFrame(current.step.chain));
      return current.step.left;
    } else if (current.step._tag === "finally") {
      this.callFrames.push(new FinalizeFrame(current.step.always));
      return current.step.first;
    } else if (current.step._tag === "bracket") {
      const bracket = current.step;
      return this.enterCritical.applySecond(current.step.resource)
        .resurrect()
        .widenError<unknown>()
        .chain((result) => suspend(() => {
          // We always leave critical sections
          this.criticalSections--;
          if (result.isLeft()) {
            return caused(result.value) as IO<unknown, unknown>;
          }
          // Push these things onto the call stack to ensure that we can correctly consume them on subsequent runs
          this.callFrames.push(new FinalizeFrame(bracket.release(result.value)));
          this.callFrames.push(new ChainFrame(bracket.consume));
          return of(result.value) as unknown as IO<unknown, unknown>;
        }));
    } else {
      throw new Error(`Bug: Unrecognized step tag: ${(current.step as any)._tag}`);
    }
  }

  @boundMethod
  private contextSwitch(
    continuation: (callback: (result: Either<Cause<unknown>, unknown>) => void) => (() => void),
    resume: (next: IO<unknown, unknown>) => void,
    complete: (result: Either<Cause<unknown>, unknown>) => void): void {
    this.asyncFrame = new AsyncFrame(continuation);
    this.asyncFrame.go((result) => {
      const next = result.fold((cause) => this.unwindError(cause, complete), (value) => this.popFrame(value, complete));
      if (next) {
        resume(next);
      }
    });
  }

  @boundMethod
  private popFrame(result: unknown,
                   complete: (result: Either<Cause<unknown>, unknown>) => void): IO<unknown, unknown> | undefined {
    const frame = this.callFrames.pop();
    if (frame) {
      return frame.apply(result);
    }
    complete(right(result));
    return;
  }

  @boundMethod
  private unwindError(cause: Cause<unknown>,
                      complete: (result: Either<Cause<unknown>, unknown>) => void): IO<unknown, unknown> | undefined {
    const finalizers: FinalizeFrame[] = [];
    let frame: ErrorFrame | undefined;
    while (!frame && this.callFrames.length > 0) {
      const candidate = this.callFrames.pop()!;
      if (candidate._tag === "error") {
        frame = candidate;
      } else if (candidate._tag === "finalize") {
        finalizers.push(candidate);
      }
    }
    if (finalizers.length > 0) {
      // If there are finalizers, create a composite finalizer action that rethrows and then repush the error
      const io = createCompositeFinalizer(cause, finalizers);
      // If we have an error handler, push it back onto the stack to handle the rethrow from the finalizer
      if (frame) {
        this.callFrames.push(frame);
      }
      return io;
    } else if (frame) {
      // If we have only a handler, invoke it here
      return frame.f(cause);
    }
    // We are done, so time to explode with a failure
    complete(left(cause));
    return;
  }

  @boundMethod
  private unwindInterrupt(): IO<unknown, unknown> | undefined {
    const finalizers: FinalizeFrame[] = [];
    while (this.callFrames.length > 0) {
      const candidate = this.callFrames.pop();
      if (candidate && candidate._tag === "finalize") {
        finalizers.push(candidate);
      }
    }
    if (finalizers.length > 0) {
      const ios = finalizers.map((final) => final.io);
      const combined: IO<never, void> =
        array.reduce(ios, of(undefined), (first, second) => first.applySecond(second.resurrect()).as(undefined));
      return combined as unknown as IO<unknown, unknown>;
    }
    return;
  }
  }

/**
 * Create a single composite uninterruptible finalizer
 * @param  cause [description] The initial cause to rethrow
 * @param  array [description] A non-empty array of FinalizeFrames
 * @return       [description] and IO action that executes all of the finalizers
 */
function createCompositeFinalizer(cause: Cause<unknown>,
                                  finalizers: FinalizeFrame[]): IO<unknown, unknown> {
  const finalizerIOs = finalizers.map((final) => final.io);
  return array.reduce(finalizerIOs, of(cause), (before, after) =>
  of(compositeCause).ap_(before).ap_(after.resurrect()))
  .widenError<unknown>()
  .chain(caused);
}

const compositeCause = (base: Cause<unknown>) => (more: Either<Cause<unknown>, unknown>): Cause<unknown> =>
  more.fold((c) => base.and(c), (_) => base);
