import { Either, left, right } from "fp-ts/lib/Either";
import { Context, Fiber, spawn } from "./fiber";
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

  public static failure<E>(e: E): IO<E, never> {
    return new IO(new Fail(e));
  }

  /**
   * Fail explicitly with a reason rather than an E.
   * This allows finalizers to rethrow nesed failures.
   * @param reason
   */
  public static raiseReason<E, A>(reason: Reason<E>): IO<E, A> {
    return new IO(new FailureReason(reason));
  }

  public static abort<E, A>(e: any): IO<E, A> {
    return new IO(new Abort(e));
  }

  public static sync<E, A>(thunk: () => A): IO<E, A> {
    return new IO(new Suspend(() => IO.of(thunk())));
  }

  public static suspend<E, A>(thunk: () => IO<E, A>) {
    return new IO(new Suspend(thunk));
  }

  public static async<E, A>(async: (cont: (result: Either<Reason<E>, A>) => void) => void) {
    return new IO(new Async(async));
  }

  public static later<A>(async: (done: (a: A) => void) => void): IO<never, A> {
    return new IO(new Async((cont) => async((a) => cont(right(a)))));
  }

  public static assimilate<A>(lazy: () => Promise<A>): IO<unknown, A> {
    return IO.async<unknown, A>((onResult) => {
      lazy()
        .then((v) => right(v))
        .catch((e) => left(new Raise<unknown>(e)))
        // ts cannot trace the types here
        .then((result) => onResult(result as Either<Reason<unknown>, A>));
    });
  }

  private constructor(public readonly step: Step<E, A>) { }

  public spawn(): IO<never, Fiber<E, A>> {
    // This has to be a function because it must be lazy to prevent stack overflow
    return IO.sync(() => new Fiber(this.launch()));
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
    return new IO(new Chain(this, f));
  }

  public widenError<EE>(this: IO<E extends EE ? E : never, A>): IO<EE, A> {
    return this as unknown as IO<EE, A>;
  }

  public widen<AA>(this: IO<E, A extends AA ? A : never>): IO<E, AA> {
    return this as unknown as IO<E, AA>;
  }

  public applySecond<B>(second: IO<E, B>): IO<E, B> {
    return this.chain((_) => second);
  }

  public applyFirst<B>(second: IO<E, B>): IO<E, A> {
    return this.chain((r) => second.map((_) => r));
  }

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
    });
  }

  public mapError<EE>(f: (e: E) => EE): IO<EE, A> {
    return this.chainError((error) => IO.failure(f(error)));
  }

  public attempt(): IO<never, Either<Raise<E>, A>> {
    return this.map<Either<Raise<E>, A>>(right)
      .chainResurrect((reason) => reason.variant === "raise" ? IO.of(left(reason)) : IO.abort(reason));
  }

  public resurrect(): IO<never, Either<Reason<E>, A>> {
    return this.map<Either<Reason<E>, A>>(right)
      .chainResurrect((reason) => IO.of(left(reason)));
  }

  public critical(): IO<E, A> {
    return new IO(new Critical(this));
  }

  public delay(millis: number): IO<E, A> {
    return IO.later((next) => {
      setTimeout(() => {
        next({});
      }, millis);
      // Sigh... typescript
    }).widenError<E>().applySecond(this);
  }

  public bracket<B>(release: (a: A) => IO<E, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Bracket(this, release, consume));
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

  private launch(): Context<E, A> {
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
  Bracket<E, any, A> |
  Critical<E, A>;

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
  constructor(public readonly async: (cont: (result: Either<Reason<E>, A>) => void) => void) { }
}

export class Chain<E, A0, A> {
  public readonly variant: "chain" = "chain";
  constructor(public readonly base: IO<E, A0>, public readonly f: (a0: A0) => IO<E, A>) { }
}

export class ChainError<E0, E, A> {
  public readonly variant: "chainerror" = "chainerror";
  constructor(public readonly base: IO<E0, A>, public readonly f: (e0: Reason<E0>) => IO<E, A>) { }
}

export class Bracket<E, R, A> {
  public readonly variant: "bracket" = "bracket";
  constructor(public readonly resource: IO<E, R>,
              public readonly release: (r: R) => IO<E, void>,
              public readonly use: (r: R) => IO<E, A>) { }
}

export class Critical<E, A> {
  public readonly variant: "critical" = "critical";
  constructor(public readonly base: IO<E, A>) { }
}
