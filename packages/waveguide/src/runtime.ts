import { boundMethod } from "autobind-decorator";
import { ForwardProxy } from "./forwardproxy";
import { IO } from "./io";
import { OneShot } from "./oneshot";
import { Abort, Cause, Completed, FiberResult, interrupted, Raise, Result, Value } from "./result";

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
    return IO.of(a) as unknown as IO<unknown, unknown>;
  }
}

class AsyncFrame {
  private proxy: ForwardProxy;
  private interrupted: boolean;
  private unwinding: boolean = false;
  private continuation: (callback: (result: Result<unknown, unknown>) => void) => () => void;
  constructor(continuation: (callback: (result: Result<unknown, unknown>) => void) => () => void) {
    this.proxy = new ForwardProxy();
    this.interrupted = false;
    this.continuation = continuation;
  }
  public go(callback: (result: Result<unknown, unknown>) => void): void {
    const adapted = (result: Result<unknown, unknown>) => {
      this.unwinding = true;
      // Attempt to ensure that we are in fact unwinding the stack
      setTimeout(() => {
        if (!this.interrupted) {
          this.interrupted = true;
          callback(result);
        }
      }, 0);
    };
    this.proxy.fill(this.continuation(adapted));
  }
  public interrupt(): void {
    this.interrupted = true;
    // Only deliver the cancel invoke if we h aven't been delivered a result
    if (!this.unwinding) {
      this.proxy.invoke();
    }
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
  public readonly result: OneShot<FiberResult<E, A>> = new OneShot();

  private started: boolean = false;
  private asyncFrame: AsyncFrame | undefined;
  private readonly callFrames: Frame[] = [];
  private criticalSections: number = 0;
  private interrupted: boolean = false;
  private suspended: boolean = true;

  private enterCritical: IO<unknown, unknown> = IO.eval(() => {
    this.criticalSections++;
  }).widenError<unknown>();

  private leaveCritical: IO<unknown, unknown> = IO.eval(() => {
    this.criticalSections--;
  }).widenError<unknown>();

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
        /**
         * It is possible for interrupts to be delivered synchronously
         * As an example, consider the of setting a Deferred.
         * The setting fiber will 'pause' in its run loop to advance the run loop of any listeners without technically
         * being suspended
         * If any of those listeners interrupt the setting fiber, we need to ensure we only finalize once.
         * As such, the contract of suspended is that it is only set to true during callback boundaries
         * and it is set to false before any additional work is done
         * We assume if we aren't suspended, then the run loop will detect the interrupt on its next step
         * and run the finalizer there
         */
        if (this.suspended) {
          this.interruptFinalize();
        }
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
    /**
     * We were interrupted so determine if we need to switch to the finalize loop
     */
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
  private complete(result: Result<unknown, unknown>): void {
    /**
     * If a result is already set, don't do anything.
     * This happens for instance, in the case of race, where setting the deferred synchronously advances
     * the supervisor fiber which will then cause a cancellation.
     * On unwind, the supervised fiber will attempt to complete here and get a multiple sets error
     */
    if (this.result.isUnset()) {
      this.result.set(new Completed(result as Result<E, A>));
    }
  }

  @boundMethod
  private interruptComplete(_: Result<unknown, unknown>): void {
    this.result.set(interrupted);
  }

  private step(current: IO<unknown, unknown>,
               resume: (next: IO<unknown, unknown>) => void,
               complete: (result: Result<unknown, unknown>) => void): IO<unknown, unknown> | undefined {
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
        return IO.caused(new Abort(e));
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
      this.callFrames.push(new FinalizeFrame(
        this.enterCritical.applySecond(current.step.always).applySecond(this.leaveCritical)));
      return current.step.first;
    } else if (current.step._tag === "bracket") {
      const bracket = current.step;
      return this.enterCritical.applySecond(current.step.resource)
        .resurrect()
        .widenError<unknown>()
        .chain((result) => IO.suspend(() => {
          // We always leave critical sections
          this.criticalSections--;
          if (result._tag === "value") {
            this.callFrames.push(new FinalizeFrame(
              this.enterCritical.applySecond(bracket.release(result.value)).applySecond(this.leaveCritical)));
            this.callFrames.push(new ChainFrame(bracket.consume));
            return IO.of(result.value) as unknown as IO<unknown, unknown>;
          }
          // Push these things onto the call stack to ensure that we can correctly consume them on subsequent runs
          return IO.caused(result) as IO<unknown, unknown>;
        }));
    } else {
      throw new Error(`Bug: Unrecognized step tag: ${(current.step as any)._tag}`);
    }
  }

  @boundMethod
  private contextSwitch(
    continuation: (callback: (result: Result<unknown, unknown>) => void) => (() => void),
    resume: (next: IO<unknown, unknown>) => void,
    complete: (result: Result<unknown, unknown>) => void): void {
    this.asyncFrame = new AsyncFrame(continuation);
    this.suspended = true;
    this.asyncFrame.go((result) => {
      this.suspended = false;
      const next = result._tag === "value" ? this.popFrame(result.value, complete) : this.unwindError(result, complete);
      if (next) {
        resume(next);
      }
    });
  }

  @boundMethod
  private popFrame(result: unknown,
                   complete: (result: Result<unknown, unknown>) => void): IO<unknown, unknown> | undefined {
    const frame = this.callFrames.pop();
    if (frame) {
      return frame.apply(result);
    }
    complete(new Value(result));
    return;
  }

  @boundMethod
  private unwindError(cause: Cause<unknown>,
                      complete: (result: Result<unknown, unknown>) => void): IO<unknown, unknown> | undefined {
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
    complete(cause);
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
        ios.reduce((first, second) => first.applySecond(second.resurrect()).as(undefined), IO.of(undefined));
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
  return finalizerIOs.reduce((before, after) => IO.of(compositeCause).ap_(before).ap_(after.resurrect()), IO.of(cause))
  .widenError<unknown>()
  .chain(IO.caused);
}

const compositeCause = (base: Cause<unknown>) => (more: Result<unknown, unknown>): Cause<unknown> =>
  more._tag === "value" ? base : base.and(more);
