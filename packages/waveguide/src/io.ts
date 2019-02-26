import { Either, left, right } from "fp-ts/lib/Either";
import { Cause, Raise } from "./cause";
import { Fiber } from "./fiber";
import { Async, Bracket, Caused, Chain, ChainError, Critical, Failed, Finally, IOStep, Of, Suspend } from "./iostep";
import { Result } from "./result";
import { Runtime } from "./runtime";
import defaultScheduler, { Scheduler } from "./scheduler";

export class IO<E, A> {
  constructor(public readonly step: IOStep<E, A>) {}

  public map<B>(f: (a: A) => B): IO<E, B> {
    return this.chain((a) => new IO(new Of(f(a))));
  }

  public map2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    return this.chain((a) => fb.map((b) => f(a, b)));
  }

  public ap<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.chain((a) => fab.map((f) => f(a)));
  }

  public ap_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>): IO<E, C> {
    return fb.ap(this);
  }

  public applyFirst<B>(fb: IO<E, B>): IO<E, A> {
    return this.map2(fb, (a, _) => a);

  }

  public applySecond<B>(fb: IO<E, B>): IO<E, B> {
    return this.map2(fb, (_, b) => b);
  }

  public product<B>(fb: IO<E, B>): IO<E, [A, B]> {
    return this.map2(fb, (a, b) => [a, b] as [A, B]);
  }

  public chain<B>(f: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Chain(this, f));
  }

  public chainCause<EE>(f: (cause: Cause<E>) => IO<EE, A>): IO<EE, A> {
    return new IO(new ChainError(this, f));
  }

  public chainError<EE>(f: (e: E) => IO<EE, A>): IO<EE, A> {
    return this.chainCause((cause) => cause._tag === "raise" ? f(cause.error) : caused(cause));
  }

  public attempt(): IO<never, Either<E, A>> {
    return this.map<Either<E, A>>(right)
      .chainError((e) => of(left(e)));
  }

  public resurrect(): IO<never, Either<Cause<E>, A>> {
    return this.map<Either<Cause<E>, A>>(right)
      .chainCause((cause) => of(left(cause)));
  }

  public ensuring<B>(always: IO<E, B>): IO<E, A> {
    return new IO(new Finally(this, always));
  }

  public bracket<B>(release: (a: A) => IO<E, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Bracket(this, release, consume));
  }

  public widen<AA>(this: IO<E, A extends AA ? AA : never>): IO<E, AA> {
    return this as unknown as IO<E, AA>;
  }

  public widenError<EE>(this: IO<E extends EE ? EE : never, A>): IO<EE, A> {
    return this as unknown as IO<EE, A>;
  }

  public empty(): IO<E, void> {
    return this.map((_) => { return; });
  }

  public as<B>(b: B): IO<E, B> {
    return this.map((_) => b);
  }

  public delay(millis: number, scheduler: Scheduler = defaultScheduler): IO<E, A> {
    return async<never, void>((resume) => {
      const handle = scheduler.after(millis, () => {
        resume(right(undefined));
      });
      return () => {
        scheduler.cancel(handle);
      };
    }).widenError<E>().applySecond(this);
  }

  public shift(scheduler: Scheduler = defaultScheduler): IO<E, A> {
    return this.delay(0, scheduler);
  }

  public critical(): IO<E, A> {
    return new IO(new Critical(this));
  }

  public fork(): IO<never, Fiber<E, A>> {
    return sync(() => {
      const runtime = new Runtime<E, A>();
      runtime.start(this);
      return new Fiber(runtime);
    });
  }

  public launch(callback?: (result: Result<E, A>) => void): () => void {
    const runtime = new Runtime<E, A>();
    if (callback) {
      runtime.result.listen(callback);
    }
    runtime.start(this);
    return () => {
      runtime.interrupt();
    };
  }

  public promised(): Promise<A> {
    return new Promise((resolve, reject) => {
      const runtime = new Runtime<E, A>();
      runtime.result.listen((result) => {
        if (result._tag === "completed") {
          resolve(result.value);
        } else if (result._tag === "failed") {
          reject(result.value);
        }
      });
      runtime.start(this);
    });
  }

  public promisedResult(): Promise<Result<E, A>> {
    return new Promise((resolve) => {
      const runtime = new Runtime<E, A>();
      runtime.result.listen(resolve);
      runtime.start(this);
    });
  }
}

export class Syntax<E> {
  public of<A>(a: A): IO<E, A> {
    return new IO(new Of(a));
  }
  public delay<A>(thunk: () => A): IO<E, A> {
    return sync(thunk);
  }
  public sync<A>(thunk: () => IO<E, A>): IO<E, A> {
    return suspend(thunk);
  }
}

const syntaxSingleton = new Syntax<any>();
export function syntax<E>(): Syntax<E> {
  return syntaxSingleton;
}

export class ErrorSyntax<A> {
  public failed<E>(e: E): IO<E, A> {
    return new IO(new Failed(e));
  }
  public raised<E>(raise: Raise<E>): IO<E, A> {
    return new IO(new Caused(raise));
  }
}

const errorSyntaxSingleton = new ErrorSyntax<any>();
export function errorSyntax<E>(): ErrorSyntax<E> {
  return errorSyntaxSingleton;
}

export function of<A>(a: A): IO<never, A> {
  return new IO(new Of(a));
}

export function failed<E>(e: E): IO<E, never> {
  return new IO(new Failed(e));
}

export function caused<E>(cause: Cause<E>): IO<E, never> {
  return new IO(new Caused(cause));
}

export function sync<E, A>(thunk: () => A): IO<E, A> {
  return new IO(new Suspend(() => syntax<E>().of(thunk())));
}

export function suspend<E, A>(thunk: () => IO<E, A>) {
  return new IO(new Suspend(thunk));
}

export function async<E, A>(start: (resume: (result: Either<Cause<E>, A>) => void) => (() => void)): IO<E, A> {
  return new IO(new Async(start));
}

export function empty<E>(): IO<E, void> {
  return sync<E, void>(() => { return; });
}

export function delay(millis: number, scheduler: Scheduler = defaultScheduler): IO<never, void> {
  return new IO(new Async((callback) => {
    function go() {
      callback(right(undefined));
    }
    const id = scheduler.after(millis, go);
    return () => {
      scheduler.cancel(id);
    };
  }));
}

export function shift(scheduler: Scheduler = defaultScheduler): IO<never, void> {
  return delay(0, scheduler);
}

export const nothing: IO<never, never> =
  new IO(new Async((_) => {
    return () => { return; };
  }));
