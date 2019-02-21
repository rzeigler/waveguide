import { Either, left, right } from "fp-ts/lib/Either";
import { Fiber, FiberHandle, spawn } from "./fiber";
import { Failure, Raise, Reason, Result, Success } from "./result";
/**
 * Initial encoding of possible IO actions
 */

export class IO<E, A> {
  public static pure<A>(a: A): IO<never, A> {
    return new IO(new Of(a));
  }

  public static of<E, A>(a: A): IO<E, A> {
    return new IO(new Of(a));
  }

  public static raise<E, A>(e: E): IO<E, A> {
    return new IO(new Fail(e));
  }

  public static fail<E>(e: E): IO<E, never> {
    return new IO(new Fail(e));
  }

  /**
   * You probably don't need this.
   * This allows the run fiber to rethrow reasons with additional information attached
   * during finalizer execution.
   * @param reason
   */
  public static failureReason<E, A>(reason: Reason<E>): IO<E, A> {
    return new IO(new FailureReason(reason));
  }

  public static abort<E, A>(e: any): IO<E, A> {
    return new IO(new Abort(e));
  }

  public static defer<E, A>(thunk: () => A): IO<E, A> {
    return new IO(new Suspend(() => IO.of(thunk())));
  }

  public static suspend<E, A>(thunk: () => IO<E, A>) {
    return new IO(new Suspend(thunk));
  }

  public static async<E, A>(async: (cont: (result: Result<E, A>) => void) => void) {
    return new IO(new Async(async));
  }

  public static asyncDefer<A>(async: (done: (a: A) => void) => void): IO<never, A> {
    return new IO(new Async((cont) => async((a) => cont(new Success(a)))));
  }

  public static assimilate<A>(lazy: () => Promise<A>): IO<unknown, A> {
    return IO.async<unknown, A>((onResult) => {
      lazy().then(Success.of).catch(Failure.ofRaise);
    });
  }

  private constructor(public readonly step: Step<E, A>) { }

  // This has to be a function because it must be lazy to prevent stack overflow
  public spawn(): IO<never, Fiber<E, A>> {
    return IO.defer(() => new Fiber(this.launch()));
  }

  public map<B>(f: (a: A) => B): IO<E, B> {
    return this.chain((a) => new IO(new Of(f(a))));
  }

  public map2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    return this.chain((a) => fb.map((b) => f(a, b)));
  }

  public voided(): IO<E, void> {
    return this.map((_) => undefined);
  }

  public as<B>(b: B): IO<E, B> {
    return this.map((_) => b);
  }

  public ap<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.chain((a) => fab.map((f) => f(a)));
  }

  public ap_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>) {
    return fb.ap(this);
  }

  public chain<B>(f: (a: A) => IO<E, B>): IO<E, B> {
    // Rewrite chain towards the right so we are less likely to grow
    // the continueChain stack during execution
    if (this.step.variant === "chain") {
      const pre = this.step.f;
      return new IO(new Chain(this.step.base, (a0: any) => new IO(new Chain(pre(a0), f))));
    }
    return new IO(new Chain(this, f));
  }

  /**
   * Widen the error type.
   * This allows introducing any error type if the error is never, or relaxing the constraint
   * on the error type to a supertype.
   *
   * ex IO.of(1).widenError<string>(): IO<string, number>
   * @param this
   */
  public widenError<EE>(this: IO<E extends EE ? E : never, A>): IO<EE, A> {
    return this as unknown as IO<EE, A>;
  }

  /**
   * Widen the success type
   * This allows introducing a success type if the current type is never, or relaxing the constraint
   * on the success type to a supertype
   * ex IO.fail("a").widen<number>(): IO<string, number>
   * @param this
   */
  public widen<AA>(this: IO<E, A extends AA ? A : never>): IO<E, AA> {
    return this as unknown as IO<E, AA>;
  }

  /**
   * Declare that this IO<E, never> exists in a chain which may produce AAs
   * This hacks around issues of doing things like recovering from IO.fail to produce As
   * @param this
   */

  public applySecond<B>(second: IO<E, B>): IO<E, B> {
    return this.chain((_) => second);
  }

  public applyFirst<B>(second: IO<E, B>): IO<E, A> {
    return this.chain((r) => second.map((_) => r));
  }

  /**
   * More powerful version of errorChain.
   * Provides a full Failure<E> structure as opposed to just the error
   * @param f
   */
  public chainResurrect<EE>(f: (reason: Reason<E>) => IO<EE, A>): IO<EE, A> {
    if (this.step.variant === "chainerror") {
      const pre = this.step.f;
      return new IO(new ChainError(this.step.base, (e: Reason<any>) => new IO(new ChainError(pre(e), f))));
    }
    return new IO(new ChainError(this, f));
  }

  public chainError<EE>(f: (e: E) => IO<EE, A>): IO<EE, A> {
    return this.chainResurrect((reason) => {
      if (reason.variant === "raise") {
        return f(reason.raise);
      } else {
        return IO.abort(reason.abort);
      }
      // It was an abort so the E type is irrelevant
    });
  }

  public mapError<EE>(f: (e: E) => EE): IO<EE, A> {
    return this.chainError((error) => IO.fail(f(error)));
  }

  /**
   * Attempt this IO materializing the failure into an Either
   * Note that this will still allow Aborts to pass through
   */
  public attempt(): IO<never, Either<Raise<E>, A>> {
    return this.map<Either<Raise<E>, A>>(right)
      .chainResurrect((reason) => reason.variant === "raise" ? IO.of(left(reason)) : IO.abort(reason));
  }

  /**
   * Attempt this IO materializing failures into an Either
   * This will lift both Raise and Abort cases into the error
   */
  public resurrect(): IO<never, Either<Reason<E>, A>> {
    return this.map<Either<Reason<E>, A>>(right)
      .chainResurrect((reason) => IO.of(left(reason)));
  }

  public delay(millis: number): IO<E, A> {
    return IO.asyncDefer((next) => {
      setTimeout(() => {
        next({});
      }, millis);
      // Sigh... typescript
    }).widenError<E>().applySecond(this);
  }

  public bracket<B>(release: (a: A) => IO<E, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return this.chain((r) => consume(r).ensuring(release(r)));
  }

  /**
   * More powerful version of applyFirst that ensures fb is run even in the case of error
   * @param fb
   */
  public ensuring<B>(fb: IO<E, B>): IO<E, A> {
    return new IO(new Ensuring(this, fb));
  }

  public run(onComplete: (result: Result<E, A>) => void): void {
    this.launch().listen(onComplete);
  }
  public toPromise(): Promise<A> {
    return new Promise((resolve, reject) => {
      this.run((result) => {
        if (result.variant === "success") {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
    });
  }

  private launch(): FiberHandle<E, A> {
    return spawn(this);
  }
}

export type Step<E, A> =
  Of<A> |
  Fail<E> |
  Abort |
  FailureReason<E> |
  Suspend<E, A> |
  Async<E, A> |
  Chain<E, any, A> |
  ChainError<any, E, A> |
  Ensuring<E, any, A>;

export class Of<A> {
  public readonly variant: "of" = "of";
  constructor(public readonly a: A) { }
}

/**
 * Allow rethrowing reasons.
 * Eases the complexity of the fiber run loop which
 * needs to frequently rethrow reasons with additional info attached
 */
export class FailureReason<E> {
  public readonly variant: "reason" = "reason";
  constructor(public readonly reason: Reason<E>) { }
}

export class Fail<E> {
  public readonly variant: "fail" = "fail";
  constructor(public readonly e: E) { }
}

export class Abort {
  public readonly variant: "abort" = "abort";
  constructor(public readonly abort: any) { }
}

export class Suspend<E, A> {
  public readonly variant: "suspend" = "suspend";
  constructor(public readonly thunk: () => IO<E, A>) { }
}

export class Async<E, A> {
  public readonly variant: "async" = "async";
  constructor(public readonly async: (cont: (result: Result<E, A>) => void) => void) { }
}

export class Chain<E, A0, A> {
  public readonly variant: "chain" = "chain";
  constructor(public readonly base: IO<E, A0>, public readonly f: (a0: A0) => IO<E, A>) { }
}

export class ChainError<E0, E, A> {
  public readonly variant: "chainerror" = "chainerror";
  constructor(public readonly base: IO<E0, A>, public readonly f: (e0: Reason<E0>) => IO<E, A>) { }
}

export class Ensuring<E, B, A> {
  public readonly variant: "ensuring" = "ensuring";
  constructor(public readonly base: IO<E, A>, public readonly ensure: IO<E, B>) { }
}
