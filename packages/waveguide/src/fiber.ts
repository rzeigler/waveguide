import { array } from "fp-ts/lib/Array";
import { Async, IO } from "./io";
import { Abort, Failure, Raise, Reason, Result, ResultListener, Success } from "./result";

/**
 * Interface encapsulating a chain like operation.
 */
interface ChainContinuation {
  chain(a: any): IO<any, any>;
}

type Continuation = ChainContinue | ChainRecover | ChainFinalize;

class ChainContinue implements ChainContinuation {
  public readonly variant: "continue" = "continue";
  constructor(public readonly f: (a: any) => IO<any, any>) { }
  public chain(a: any): IO<any, any> { return this.f(a); }
}

class ChainRecover implements ChainContinuation {
  public readonly variant: "recover" = "recover";
  constructor(public readonly f: (a: Reason<any>) => IO<any, any>) { }
  // default execution returns an immediate value so that that we can
  // pop this from the stack and immediately continue executing
  public chain(a: any): IO<any, any> {
    // Also, barf...
    return IO.of(a) as unknown as IO<any, any>;
  }
}

class ChainFinalize implements ChainContinuation {
  public readonly variant: "ensure" = "ensure";
  constructor(public readonly finalize: IO<any, any>) { }
  public chain(a: any): IO<any, any> {
    return this.finalize.as(a);
  }
}

type FiberState = "suspended" | "running" | "finished" | "terminated";

export class Fiber<E, A> {
  public readonly join: IO<E, A>;
  constructor(private handle: FiberHandle<E, A>) {
    this.join = IO.async((listener) => {
      handle.listen(listener);
    });
  }
}

export class FiberHandle<E, A> {
  private result: Result<E, A> | null = null;
  private listeners: Array<ResultListener<E, A>> = [];

  private continuations: Continuation[] = [];
  private state: FiberState = "suspended";
  private terminating: boolean = false;

  public listen(listener: ResultListener<E, A>) {
    if (this.result === null) {
      this.listeners.push(listener);
    } else {
      listener(this.result);
    }
  }

  public finished(): boolean {
    return this.state === "finished";
  }

  public suspended(): boolean {
    return this.state === "suspended";
  }

  public running(): boolean {
    return this.state === "running";
  }

  public resume(): void {
    if (!this.suspended()) {
      throw new Error("Bug: Resume precondition failed; the fiber must be suspended");
    }
    this.state = "running";
  }

  public suspend(): void {
    if (!this.running()) {
      throw new Error("Bug: Suspend precondition failed; the fiber must be running");
    }
    this.state = "suspended";
  }

  public finish(result: Result<E, A>) {
    if (!this.running()) {
      throw new Error("Bug: Commit precondition failed; the fiber must be running");
    }
    this.state = "finished";
    this.result = result;
    this.listeners.forEach((l) => l(result));
  }

  public pushContinue(cont: Continuation): void {
    this.continuations.push(cont);
  }

  public chainOrFinish(a: any): IO<any, any> | null {
    const continuer = this.continuations.pop();
    if (continuer) {
      return continuer.chain(a);
    }
    this.finish(new Success(a));
    return null;
  }

  public handleOrFinish(reason: Reason<any>): IO<any, any> | null {
    const ensuring: ChainFinalize[] = [];
    // Find an error handler, collecting any ensures that we find along the way
    let recover = this.continuations.pop();
    while (recover && recover.variant !== "recover") {
      if (recover.variant === "ensure") {
        ensuring.push(recover);
      }
      recover = this.continuations.pop();
    }

    const finalizer = ensuring.length === 0 ? null : fuseManyFinalizers(reason, ensuring);

    if (recover && finalizer) {
      // We have a recovery step and a finalizer
      // In this case, push the recover back onto continuations and return the finalizer (which will rethrow the error)
      this.continuations.push(recover);
      return finalizer;
    } else if (finalizer) {
      // We have a finalizer but no recovery step
      // Run the finalizer to rethrow the error which will rethrow at the end
      return finalizer;
    } else if (recover) {
      // We don't have a finalizer step so immediately invoke the recovery
      return recover.f(reason);
    } else {
      // We don't even have a recovery step, so we are done
      this.finish(new Failure(reason));
      return null;
    }
  }

  public continueOrFinish(e: Result<any, any>): IO<any, any> | null {
    if (e.variant === "success") {
      return this.chainOrFinish(e.value);
    } else {
      return this.handleOrFinish(e.reason);
    }
  }
}

// Assumes that array is non-empty
function fuseManyFinalizers(cause: Reason<any>, finalizers: ChainFinalize[]): IO<any, any> {
  const ios = finalizers.map((f) => f.finalize);
  const fused = array.reduce(ios, IO.of(cause), (left, right) =>
    left.chain((reason) =>
      right.resurrect()
        .widenError<any>()
        .map((result) => result.isLeft() ? reason.and(result.value) : reason))
  );
  return fused.chain((reason) => IO.failureReason(reason));
}

export function spawn<E, A>(io: IO<E, A>): FiberHandle<E, A> {
  const fiber = new FiberHandle<E, A>();
  run(io, fiber);
  return fiber;
}

function run(io: IO<any, any>, fiber: FiberHandle<any, any>): void {
  let current: IO<any, any> | null = io;
  function resume(result?: Result<any, any>): void {
    if (current === null && !result) {
      throw new Error("Bug: Unable to resume; there is no way to continue");
    }
    if (current !== null && result) {
      throw new Error("Bug: Unable to resume; there are multiple ways to continue");
    }
    fiber.resume();
    // Handle the resume case when current was set to null by async
    if (result) {
      current = fiber.continueOrFinish(result);
    }
    while (current !== null) {
      if (current.step.variant === "of") {
        current = fiber.chainOrFinish(current.step.a);
      } else if (current.step.variant === "fail") {
        current = fiber.handleOrFinish(new Raise(current.step.e));
      } else if (current.step.variant === "abort") {
        current = fiber.handleOrFinish(new Abort(current.step.abort));
      } else if (current.step.variant === "reason") {
        current = fiber.handleOrFinish(current.step.reason);
      } else if (current.step.variant === "suspend") {
        try {
          current = current.step.thunk();
        } catch (e) {
          // 'userland' threw lets trigger an abort because this is a bug
          current = IO.abort(e);
        }
      } else if (current.step.variant === "async") {
        const step: Async<any, any> = current.step;
        // we need to break the loop so that we can re-resume in a different tick
        current = null;
        fiber.suspend();
        step.async(resume);
      } else if (current.step.variant === "chain") {
        // Peel a layer off
        fiber.pushContinue(new ChainContinue(current.step.f));
        current = current.step.base;
      } else if (current.step.variant === "chainerror") {
        fiber.pushContinue(new ChainRecover(current.step.f));
        current = current.step.base;
      } else {
        const ensuring = current.step;
        fiber.pushContinue(new ChainFinalize(ensuring.ensure));
        current = ensuring.base;
      }
    }
    if (fiber.running()) {
      throw new Error("Bug: Exiting run loop without suspending or committing");
    }
  }
  resume();
}
