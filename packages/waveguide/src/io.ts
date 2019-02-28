import { Deferred } from "./deferred";
import { Fiber } from "./fiber";
import { Async, Bracket, Caused, Chain, ChainError, Critical, Failed, Finally, IOStep, Of, Suspend } from "./iostep";
import { Attempt, Cause, FiberResult, First, OneOf, Raise, Result, Second, Value } from "./result";
import { Runtime } from "./runtime";
import defaultScheduler, { Scheduler } from "./scheduler";

export class IO<E, A> {
  public static of<A>(a: A): IO<never, A> {
    return new IO(new Of(a));
  }

  public static pure<E, A>(a: A): IO<E, A> {
    return new IO(new Of(a));
  }

  public static eval<A>(thunk: () => A): IO<never, A> {
    return new IO(new Suspend(() => IO.of(thunk())));
  }

  public static suspend<E, A>(thunk: () => IO<E, A>): IO<E, A> {
    return new IO(new Suspend(thunk));
  }

  public static failed<E>(e: E): IO<E, never> {
    return new IO(new Failed(e));
  }

  public static caused<E>(cause: Cause<E>): IO<E, never> {
    return new IO(new Caused(cause));
  }

  public static async<E, A>(start: (resume: (result: Result<E, A>) => void) => (() => void)): IO<E, A> {
    return new IO(new Async(start));
  }

  public static empty(): IO<never, void> {
    return IO.of(undefined);
  }

  public static delay(millis: number, scheduler: Scheduler = defaultScheduler): IO<never, void> {
    return new IO(new Async((callback) => {
      function go() {
        callback(new Value(undefined));
      }
      const id = scheduler.after(millis, go);
      return () => {
        scheduler.cancel(id);
      };
    }));
  }

  public static yield_(scheduler: Scheduler = defaultScheduler): IO<never, void> {
    return IO.delay(0, scheduler);
  }

  public static never_(): IO<never, never> {
    return new IO(new Async((_) => {
      return () => { return; };
    }));
  }

  public static assimilate<A>(thunk: () => Promise<A>): IO<unknown, A> {
    return IO.async<unknown, A>((callback) => {
      thunk().then((v) => callback(new Value(v))).catch((e) => callback(new Raise(e)));
      /**
       * Promises don't support cancellation, so we return a no-op for the cancel action
       * and mark this as a critical section
       */
      return () => {
        return;
      };
    }).critical();
  }

  private constructor(public readonly step: IOStep<E | never, A | never>) {}

  public map<B>(f: (a: A) => B): IO<E, B> {
    return this.chain((a) => new IO(new Of(f(a))));
  }

  public map2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    return this.chain((a) => fb.map((b) => f(a, b)));
  }

  public parMap2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    const fa = this;
    return fa.fork().widenError<E>().bracket((fibera) => fibera.interrupt.widenError<E>(), (fibera) =>
      fb.fork().widenError<E>().bracket((fiberb) => fiberb.interrupt.widenError<E>(), (fiberb) =>
        fibera.join.map2(fiberb.join, f)));
  }

  public ap<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.chain((a) => fab.map((f) => f(a)));
  }

  public parAp<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.parMap2(fab, (a, f) => f(a));
  }

  public ap_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>): IO<E, C> {
    return fb.ap(this);
  }

  public parAp_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>): IO<E, C> {
    return fb.parAp(this);
  }

  public applyFirst<B>(fb: IO<E, B>): IO<E, A> {
    return this.map2(fb, (a, _) => a);
  }

  public parApplyFirst<B>(fb: IO<E, B>): IO<E, A> {
    return this.parMap2(fb, (a, _) => a);
  }

  public applySecond<B>(fb: IO<E, B>): IO<E, B> {
    return this.map2(fb, (_, b) => b);
  }

  public parApplySecond<B>(fb: IO<E, B>): IO<E, B> {
    return this.parMap2(fb, (_, b) => b);
  }

  public product<B>(fb: IO<E, B>): IO<E, [A, B]> {
    return this.map2(fb, (a, b) => [a, b] as [A, B]);
  }

  public parProduct<B>(fb: IO<E, B>): IO<E, [A, B]> {
    return this.parMap2(fb, (a, b) => [a, b] as [A, B]);
  }

  public join<AA>(this: IO<E, IO<E | never, AA>>): IO<E, AA> {
    return this.chain((io) => io);
  }

  public chain<EE, B>(this: IO<EE | never, A>, f: (a: A) => IO<EE, B>): IO<EE, B> {
    return new IO(new Chain(this, f));
  }

  public chainCause<AA, EE>(this: IO<E, AA | never>, f: (cause: Cause<E>) => IO<EE, AA>): IO<EE, AA> {
    return new IO(new ChainError(this, f));
  }

  public chainError<AA, EE>(this: IO<E, AA | never>, f: (e: E) => IO<EE, AA>): IO<EE, AA> {
    return this.chainCause((cause) => cause._tag === "raise" ? f(cause.error) : IO.caused(cause));
  }

  public attempt(): IO<never, Attempt<E, A>> {
    return this.map<Attempt<E, A>>((v) => new Value(v))
      .chainCause((cause) => cause._tag === "raise" ? IO.of(cause) : IO.caused(cause));
  }

  public resurrect(): IO<never, Result<E, A>> {
    return this.map<Result<E, A>>((v) => new Value(v))
      .chainCause((cause) => IO.of(cause));
  }

  /**
   * Inverse of resurrect which submerges an either back into the IO
   * @param this
   */
  public slay<EE, AA>(this: IO<never, Result<EE, AA>>): IO<EE, AA> {
    return this.widenError<EE>()
      .chain((result) => result._tag === "value" ? IO.of(result.value) as unknown as IO<EE, AA> : IO.caused(result));
  }

  public forever(): IO<E, A> {
    return this.chain((_) => this.forever());
  }

  public ensuring<B>(always: IO<E, B>): IO<E, A> {
    return new IO(new Finally(this, always));
  }

  public bracket<B>(release: (a: A) => IO<E, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Bracket(this, release, consume));
  }

  /**
   * A weaker form of bracket that does not provide the resource to the continuation
   * Used for cases where the inner effect may depends on the effects of the resource acquisition/release
   * But not the resource itself
   * @param release
   * @param inner
   */
  public bracket_<B>(release: (a: A) => IO<E, void>, inner: IO<E, B>): IO<E, B> {
    return this.bracket(release, (_) => inner);
  }

  public widen<AA>(this: IO<E, A extends AA ? AA : never>): IO<E, AA> {
    return this as unknown as IO<E, AA>;
  }

  public widenError<EE>(this: IO<E extends EE ? EE : never, A>): IO<EE, A> {
    return this as unknown as IO<EE, A>;
  }

  public void(): IO<E, void> {
    return this.map((_) => { return; });
  }

  public as<B>(b: B): IO<E, B> {
    return this.map((_) => b);
  }

  public race(other: IO<E, A>): IO<E, A> {
    return Deferred.alloc<Result<E, A>>()
      .chain((deferred) =>
        raceInto(deferred, this)
          .bracket_(fiberInterrupt, raceInto(deferred, other)
            .bracket_(fiberInterrupt, deferred.get)))
      .slay();
  }

  public raceOneOf<B>(other: IO<E, B>): IO<E, OneOf<A, B>> {
    return this.map<OneOf<A, B>>((a) => new First(a))
      .race(other.map((b) => new Second(b)));
  }

  public delay(millis: number, scheduler: Scheduler = defaultScheduler): IO<E, A> {
    return IO.async<never, void>((resume) => {
      const handle = scheduler.after(millis, () => {
        resume(new Value(undefined));
      });
      return () => {
        scheduler.cancel(handle);
      };
    }).widenError<E>().applySecond(this);
  }

  public yield_(scheduler: Scheduler = defaultScheduler): IO<E, A> {
    return this.delay(0, scheduler);
  }

  public critical(): IO<E, A> {
    return new IO(new Critical(this));
  }

  public when(this: IO<E, void>, test: IO<E, boolean>): IO<E, void> {
    return test.chain((go) => go ? this : IO.empty() as unknown as IO<E, void>);
  }

  public fork(): IO<never, Fiber<E, A>> {
    return IO.eval(() => {
      const runtime = new Runtime<E, A>();
      runtime.start(this);
      return new Fiber(runtime);
    }).yield_();
  }

  public launch(callback?: (result: FiberResult<E, A>) => void): () => void {
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
          if (result.result._tag === "value") {
            resolve(result.result.value);
          } else {
            reject(result.result.error);
          }
        }
        // Don't resolve for interrupts
      });
      runtime.start(this);
    });
  }

  public promisedResult(): Promise<FiberResult<E, A>> {
    return new Promise((resolve) => {
      const runtime = new Runtime<E, A>();
      runtime.result.listen(resolve);
      runtime.start(this);
    });
  }
}

function raceInto<E, A>(defer: Deferred<Result<E, A>>, io: IO<E, A>): IO<never, Fiber<never, void>> {
  return io.resurrect()
    .chain((result) =>
      // The when prevents double sets in the case that both fibers are fully synchronous
      defer.set(result).when(defer.isUnset))
    .fork();
}

function fiberInterrupt<E, A>(fiber: Fiber<E, A>): IO<never, void> {
  return fiber.interrupt;
}
