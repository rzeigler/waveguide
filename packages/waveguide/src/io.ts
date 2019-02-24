import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { bootstrap, Context, Fiber } from "./fiber";
import { Ref } from "./ref";
import { Raise, Reason, Result } from "./result";
import realScheduler, { Scheduler } from "./time";

export class IO<E, A> {
  public static pure<A>(a: A): IO<never, A> {
    return new IO(new Of(a));
  }

  public static of<E, A>(a: A): IO<E, A> {
    return new IO(new Of(a));
  }

  public static voided(): IO<never, void> {
    return IO.sync(() => {
      return;
    });
  }

  public static shift(): IO<never, void> {
    return IO.voided().shift();
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

  public static async<E, A>(async: (cont: (result: Either<Reason<E>, A>) => void) => (() => void)) {
    return new IO(new Async(async));
  }

  public static later<A>(async: (done: (a: A) => void) => (() => void)): IO<never, A> {
    return new IO(new Async((cont) => async((a) => cont(right(a)))));
  }

  /**
   * Construct an IO from a generator block.
   * This trades all typesafety for a monadic do constructor.
   * The type parameters are assertions to fit the IO into existing blocks
   * @param block the do block
   * All yields must return IO actions, failure to do so will cause an abort.
   * The final return may be whatever value you desire. If you do not have a final
   * return statement, the correct type is IO<E, void>
   * If you return an IO as a final action, the correct type is IO<E, IO<E2, A2>>
   */
  public static co<E, A>(block: () => Iterator<any>): IO<E, A> {
    return IO.sync<E, Iterator<any>>(block)
      .chain((iter) => Ref.of(iter).product(Ref.of<Option<any>>(none)).widenError<E>())
        .chain(([cell, last]) => driveIterator(cell, last));
  }

  /**
   * Construct an IO from a promise factory
   * @param lazy
   */
  public static assimilate<A>(lazy: () => Promise<A>): IO<unknown, A> {
    return IO.async<unknown, A>((onResult) => {
      let cancelled = false;
      lazy()
        .then((v) => right(v))
        .catch((e) => left(new Raise<unknown>(e)))
        // ts cannot trace the types here
        .then((result) => {
          if (!cancelled) {
            onResult(result as Either<Reason<unknown>, A>);
          }
        });
      return () => {
        cancelled = true;
      };
    });
  }

  private constructor(public readonly step: Step<E, A>) { }

  public spawn(): IO<never, Fiber<E, A>> {
    // This has to be a function because it must be lazy to prevent stack overflow
    return IO.sync(() => {
      const context = this.launch();
      context.go();
      return new Fiber(context);
    });
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

  public shift(scheduler: Scheduler = realScheduler): IO<E, A> {
    return this.delay(0, scheduler);
  }

  public delay(millis: number, scheduler: Scheduler = realScheduler): IO<E, A> {
    return scheduler.schedule(millis, this);
  }

  public ensure<B>(ensure: IO<E, B>): IO<E, A> {
    return new IO(new Ensure(this, ensure));
  }

  public bracket<B>(release: (a: A) => IO<E, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Bracket(this, release, consume));
  }

  public product<B>(other: IO<E, B>): IO<E, [A, B]> {
    return this.chain((a: A) => other.map((b: B) => [a, b] as [A, B]));
  }

  public execute(): () => void {
    return this.run((result) => {
      if (result.variant === "failure") {
        throw result.reason;
      }
    });
  }

  public run(onComplete: (result: Result<E, A>) => void): () => void {
    const context = this.launch();
    context.listen(onComplete);
    context.go();
    return () => context.kill();
  }

  public toPromise(): [() => void, Promise<A>] {
    const context = this.launch();
    return [
      () => context.kill(),
      new Promise((resolve, reject) => {
        context.go();
        context.listen((result) => {
          if (result.variant === "success") {
            resolve(result.value);
          } else if (result.variant === "failure") {
            reject(result.reason);
          }
          // We don't care about terminate in this case
        });
      })
    ];
  }

  public toPromiseResult(): [() => void, Promise<Result<E, A>>] {
    const context = this.launch();
    return [
      () => context.kill(),
      new Promise((resolve) => {
        context.go();
        context.listen(resolve);
      })
    ];
  }

  private launch(): Context<E, A> {
    return bootstrap(this);
  }
}

function driveIterator(ref: Ref<Iterator<any>>, last: Ref<Option<any>>): IO<any, any> {
  return ref.get.product(last.get)
    .widenError<any>()
    .chain(([iter, optLast]) => {
      return optLast.fold(IO.sync<any, any>(() => iter.next()),
      (v) => IO.sync<any, any>(() => iter.next(v)))
      .chain((result) => {
        // If we are done, terminate the loop
        if (result.done) {
          return IO.of<any, any>(result.value);
        } else if (result.value instanceof IO) {
          // Otherwise chain against the yielded value and put the result into the last prior to advancing
          return (result.value as IO<any, any>).chain((v) => last.set(some(v)).widenError<any>())
            .applySecond(driveIterator(ref, last));
        } else {
          return IO.abort<any, any>(new Error("Bug: IO.co generator returned a non-IO value during yield"));
        }
      });
    });
}

/**
 * Initial encoding of possible IO actions
 */
export type Step<E, A> =
  Of<A>
  | Fail<E>
  | Abort
  | FailureReason<E>
  | Suspend<E, A>
  | Async<E, A>
  | Chain<E, any, A>
  | ChainError<any, E, A>
  | Bracket<E, any, A>
  | Ensure<E, A, any>
  | Critical<E, A>;

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
  constructor(public readonly async: (cont: (result: Either<Reason<E>, A>) => void) => (() => void)) { }
}

export class Chain<E, A0, A> {
  public readonly variant: "chain" = "chain";
  constructor(public readonly base: IO<E, A0>, public readonly f: (a0: A0) => IO<E, A>) { }
}

export class ChainError<E0, E, A> {
  public readonly variant: "chainerror" = "chainerror";
  constructor(public readonly base: IO<E0, A>, public readonly f: (e0: Reason<E0>) => IO<E, A>) { }
}

export class Ensure<E, A, B> {
  public readonly variant: "ensure" = "ensure";
  constructor(public readonly io: IO<E, A>, public readonly ensure: IO<E, B>) { }
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
