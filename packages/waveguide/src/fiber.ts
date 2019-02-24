import { array } from "fp-ts/lib/Array";
import { Either, left, right } from "fp-ts/lib/Either";
import { Async, IO } from "./io";
import { Abort, Failure, Raise, Reason, Result, ResultListener, Success, Terminated } from "./result";

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
  public readonly variant: "finalize" = "finalize";
  constructor(public readonly finalize: IO<any, any>) { }
  public chain(a: any): IO<any, any> {
    return this.finalize.as(a);
  }
}

export class Fiber<E, A> {
  public readonly join: IO<E, A>;
  public readonly cancel: IO<never, void>;

  constructor(context: Context<E, A>) {
    this.join = IO.async<E, A>((listener) => {
      function go(result: Result<E, A>) {
        if (result.variant === "success") {
          listener(right(result.value));
        } else if (result.variant === "failure") {
          listener(left(result.reason));
        }
        // Joining on a terminated fiber is a hang
      }
      context.listen(go);
      return () => {
        context.unlisten(go);
      };
    });
    this.cancel = IO.sync(() => {
      context.kill();
    });
  }
}

function noop(): void {
  return;
}

type FiberState = "suspended" | "running" | "done";

export class Context<E, A> {
  private result: Result<E, A> | null = null;
  private listeners: Array<ResultListener<E, A>> = [];

  private continuations: Continuation[] = [];
  private state: FiberState = "suspended";

  private criticals: number = 0;
  private terminating: boolean = false;
  private halt: () => void = noop;

  constructor(public readonly go: () => void) { }

  /* Perform the suspend of an async */
  public doSuspend(async: Async<any, any>, resume: (result: Either<Reason<any>, any>) => void): void {
    let done = false;
    const connect = (result: Either<Reason<any>, any>): void => {
      if (!done) {
        // defend against things being invoked mulitple times;
        done = true;
        resume(result);
      }
      this.halt = noop;
    };
    const impl = async.async(connect);
    this.halt = () => {
      if (!done) {
        done = true;
        impl();
        // If this is invoked, then we were allowed to do early termination
        // Because we weren't in a critical section
        // This means we should attempt to complete the fiber
        this.finalizeFiber();
      }
      this.halt = noop;
    };
  }

  public shouldTerminate(): boolean {
    return this.terminating;
  }

  public requestTerminate(): void {
    this.terminating = true;
    console.log(this.criticals);
    // Don't invoke the halt and finish with terminated unless we are outside of criticals
    if (this.criticals <= 0) {
      console.log("criticals, ", 0);
      this.halt();
    }
  }

  public listen(listener: ResultListener<E, A>) {
    if (this.result === null) {
      this.listeners.push(listener);
    } else {
      listener(this.result);
    }
  }

  public unlisten(listener: ResultListener<E, A>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public isDone(): boolean {
    return this.state === "done";
  }

  public isSuspended(): boolean {
    return this.state === "suspended";
  }

  public isRunning(): boolean {
    return this.state === "running";
  }

  public getState(): FiberState {
    return this.state;
  }

  public resume(): void {
    if (!this.isSuspended()) {
      throw new Error("Bug: Resume precondition failed; the fiber must be suspended");
    }
    this.state = "running";
  }

  public suspend(): void {
    if (!this.isRunning()) {
      throw new Error("Bug: Suspend precondition failed; the fiber must be running");
    }
    this.state = "suspended";
  }

  public finish(result: Result<E, A>) {
    if (this.isDone()) {
      throw new Error("Bug: Commit precondition failed; the fiber must not be done");
    }
    this.state = "done";
    this.result = result;
    this.listeners.forEach((l) => l(result));
  }

  public enterCritical(): number {
    this.criticals++;
    return this.criticals;
  }

  public leaveCritical(): number {
    this.criticals--;
    return this.criticals;
  }

  public reentrantCriticals(): number {
    return this.criticals;
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
    const finalizers: ChainFinalize[] = [];
    // Find an error handler, collecting any ensures that we find along the way
    let recover = this.continuations.pop();
    while (recover && recover.variant !== "recover") {
      if (recover.variant === "finalize") {
        finalizers.push(recover);
      }
      recover = this.continuations.pop();
    }
    const finalizer = finalizers.length === 0 ? null : fuseErrorFinalizer(reason, finalizers);
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

  public terminationFinalizer(): IO<any, any> | null {
    const finalizers: ChainFinalize[] = (this.continuations
      .filter((c) => c.variant === "finalize") as ChainFinalize[]);
    if (finalizers.length === 0) {
      return null;
    }
    return finalizers.map((flz) => flz.finalize)
      .reduce((l, r) => l.applySecond(r));
  }

  public finalizeFiber(): void {
    const final = this.terminationFinalizer();
    if (!final) {
      this.finish(new Terminated());
    } else {
      this.suspend();
      run(final, this, "terminate");
    }
  }

  public kill() {
    if (this.state === "running") {
      throw new Error("Bug: Terminate called on fiber that is running");
    } else if (this.state === "suspended" && !this.terminating) {
      console.log("requesting terminate");
      this.requestTerminate();
    }
    // Else we are done because finished, terminated, or terminating
  }

  public continueOrFinish(e: Either<Reason<any>, any>): IO<any, any> | null {
    return e.fold((reason) => this.handleOrFinish(reason), (value) => this.chainOrFinish(value));
  }

}

function fuseErrorFinalizer(cause: Reason<any>, finalizers: ChainFinalize[]): IO<any, any> {
  const ios = finalizers.map((f) => f.finalize);
  const fused = array.reduce(ios, IO.of(cause), (seed, finalizer) =>
    seed.chain((reason) =>
      finalizer.resurrect()
        .widenError<any>()
        .map((result) => result.isLeft() ? reason.and(result.value) : reason))
  );
  // Now that we have made all the finalizers into one nested IO, we should rethrow the initialize error
  return fused.chain((reason) => IO.raiseReason(reason));
}

export function bootstrap<E, A>(io: IO<E, A>): Context<E, A> {
  const context = new Context<E, A>(() => {
    run(io, context, "run");
  });
  return context;
}

type RunMode = "run" | "terminate";

/**
 * Handling termination
 * What does it mean to terminate a running fiber?
 *
 * Assume that it is not possible for a fiber to terminate itself (the mechanism for this is raise)
 * Therefore, we may assume a fiber being terminated is always in the suspended state
 *
 * From here there are 3 options.
 *
 * We are either in a critical section, we aren't, we are terminating/terminated.
 *
 * If terminating/terminated, do nothing
 *
 * If we are not in a critical section, we need to invoke the cancellation handler, mark terminating and then
 *  begin unwinding finalizers.
 * The cancellation action should wrap the async cancellation handler but also latch the resume connection to ensure
 * buggy cancellation doesn't cause action invocation after cancelling.
 *
 * If we are in a critical section, we need to mark terminating so that ever execution of the runloop can check
 * current terminating state and if not in a critical section, can then begin unwindind for termination
 */

function shouldContinue(context: Context<any, any>, mode: RunMode): boolean {
  return (context.isRunning() && mode === "run" && (!context.shouldTerminate() || context.reentrantCriticals() > 0)) ||
    (context.isRunning() && mode === "terminate");
}

function run(io: IO<any, any>, context: Context<any, any>, mode: RunMode): void {
  const enterCritical = IO.sync(() => {
    context.enterCritical();
  });
  const leaveCritical = IO.sync(() => {
    context.leaveCritical();
  });

  let current: IO<any, any> | null = io;
  function resume(result?: Either<Reason<any>, any>): void {
    if (!context.isSuspended()) {
      throw new Error(`Bug: Unable to resume; fiber is not suspended, it is ${context.getState()}`);
    }
    if (current === null && !result) {
      throw new Error("Bug: Unable to resume; there is no way to continue");
    }
    if (current !== null && result) {
      throw new Error("Bug: Unable to resume; there are multiple ways to continue");
    }
    context.resume();
    // Handle the resume case when current was set to null by async
    if (result) {
      current = context.continueOrFinish(result);
    }
    let async: Async<any, any> | null = null;
    // context.running() should be true whenever current !== null
    // As soon as we hit mode terminate we want to abort as soon as there are no critical sections
    while (shouldContinue(context, mode)) {
      if (current === null) {
        throw new Error("Bug: Context is running but there is no current IO");
      } else {
        if (current.step.variant === "of") {
          current = context.chainOrFinish(current.step.a);
        } else if (current.step.variant === "fail") {
          current = context.handleOrFinish(new Raise(current.step.e));
        } else if (current.step.variant === "abort") {
          current = context.handleOrFinish(new Abort(current.step.abort));
        } else if (current.step.variant === "reason") {
          current = context.handleOrFinish(current.step.reason);
        } else if (current.step.variant === "suspend") {
          try {
            current = current.step.thunk();
          } catch (e) {
            // 'userland' threw lets trigger an abort because this is a bug
            current = IO.abort(e);
          }
        } else if (current.step.variant === "async") {
          async = current.step;
          // we need to break the loop so that we can re-resume in a different tick
          current = null;
          context.suspend();
        } else if (current.step.variant === "chain") {
          // Peel a layer off
          context.pushContinue(new ChainContinue(current.step.f));
          current = current.step.base;
        } else if (current.step.variant === "chainerror") {
          context.pushContinue(new ChainRecover(current.step.f));
          current = current.step.base;
        } else if (current.step.variant === "critical") {
          current = enterCritical.applySecond(current.step.base).ensure(leaveCritical);
        } else if (current.step.variant === "ensure") {
          context.pushContinue(new ChainFinalize(current.step.ensure));
          current = current.step.io;
        } else {
          const bracket = current.step;
          current = enterCritical.applySecond(bracket.resource
            .resurrect()
            .widenError<any>()
            .chain((either) =>
              either.fold(
                // If resource acquire failed, just leave critical section and re-raise
                (reason) => leaveCritical.applySecond(IO.raiseReason(reason)),
                (resource) => IO.sync(() => {
                   // Don't leave the critical section until this block which ensures finalizer is set up
                   context.leaveCritical();
                    // Do all the actions here in one sync, because if we attempt to use enterCritical,
                  // we will end up consuming some of the finalizers we push here
                   context.pushContinue(new ChainFinalize(bracket.release(resource)));
                   context.pushContinue(new ChainContinue(bracket.use));
                   return resource;
                })
              )
            ));
        }
      }
    }
    // We broke out of the above loop because we are attempting to terminate
    if (context.shouldTerminate() && context.reentrantCriticals() <= 0 && mode === "run") {
      context.finalizeFiber();
    } else if (context.isSuspended()) {
      if (!async) {
        throw new Error("Bug: Suspended without an async to evaluate");
      }
      context.doSuspend(async, resume);
    } else if (context.isRunning()) {
      throw new Error("Bug: Exiting run loop without suspending or committing");
    }
  }
  resume();
}
