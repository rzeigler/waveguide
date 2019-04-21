// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { Deferred } from "./deferred";
import { Fiber } from "./fiber";
import {
  Async,
  Caused,
  Chain,
  ChainError,
  Critical,
  Failed,
  IOStep,
  Of,
  OnDone,
  OnInterrupted,
  Suspend} from "./internal/iostep";
import { Runtime } from "./internal/runtime";
import { Ref } from "./ref";
import { Abort, Attempt, Cause, FiberResult, Raise, Result, Value } from "./result";

export class IO<E, A> {
  /**
   * Construct an IO from a pure value.
   * @param a
   */
  public static of<A>(a: A): IO<never, A> {
    return new IO(new Of(a));
  }

  /**
   * Construct an IO from a pure value.
   *
   * Allows specifying an error type (which could have been never) to fit into
   * the type checker.
   * @param a
   */
  public static pure<E, A>(a: A): IO<E, A> {
    return new IO(new Of(a));
  }

  /**
   * Construct an IO that when run will evaluate the provided function to produce a value.
   *
   * The contract of the function is that it will never fail, however, any exceptions
   * thrown during the execution of the function will trigger an Abort and begin cleanup
   * @param thunk a function returning an A
   */
  public static eval<A>(thunk: () => A): IO<never, A> {
    return new IO(new Suspend(() => IO.of(thunk())));
  }

  /**
   * Construct an IO that when run will produce the next IO to run.
   *
   * This is useful in the case where the synchronous effect you are performing may
   * fail or you want to do some effectful setup before dispatching the next action.
   *
   * @example
   * ```
   * (str: string) => IO.suspend<string, number>(() => {
   *    const num = parseInt(str, 10);
   *    if (num === num) {
   *      return IO.of(num);
   *    } else {
   *      return IO.failed(str);
   *    }
   * });
   * ```
   * @param thunk a function returning the next IO to r un
   */
  public static suspend<E, A>(thunk: () => IO<E, A>): IO<E, A> {
    return new IO(new Suspend(thunk));
  }

  /**
   * Construct an IO that is failed.
   * @param e
   */
  public static failed<E>(e: E): IO<E, never> {
    return new IO(new Failed(e));
  }

  /**
   * Construct an IO that has aborted with the given reason
   * @param abort
   */
  public static aborted(abort: Abort): IO<never, never> {
    return new IO(new Caused(abort));
  }

  /**
   * Construct an IO that failed with the given cause.
   *
   * You probably don't need this. It exists to facilitate easily reraising errors in the runtime.
   * @param cause
   */
  public static caused<E>(cause: Cause<E>): IO<E, never> {
    return new IO(new Caused(cause));
  }

  /**
   * Construct an IO from an asynchronous effect.
   *
   * Evaluating this IO will cause the runloop to pause and then resume once a value is delivered to context switch.
   * ContextSwitch also has a means of setting cancellation logic.
   * @param start
   */
  public static async<E, A>(start: (contextSwitch: ContextSwitch<E, A>) => void): IO<E, A> {
    return new IO(new Async(start));
  }

  /**
   * Construct an IO that is already succeeded with an undefined value
   */
  // TODO: This should probably be a constant
  public static void<E = never>(): IO<E, void> {
    return IO.pure(undefined);
  }

  /**
   * Construct an IO that will succeed with undefined after some duration
   * @param millis the delay
   */
  public static delay(millis: number): IO<never, void> {
    return new IO(new Async((contextSwitch) => {
      function go() {
        contextSwitch.resume(new Value(undefined));
      }
      const id = setTimeout(go, millis);
      contextSwitch.setAbort(() => {
        clearTimeout(id);
      });
    }));
  }

  /**
   * Construct an IO that will introduce an asynchronous boundary.
   * Can be used to prevent blocking the runloop for very long synchronous effects.
   */
  public static yield_(): IO<never, void> {
    return IO.delay(0);
  }

  /**
   * Construct an IO that never succeeds or errors.
   * Useful as a base case for racing many IOs.
   */
  public static never_(): IO<never, never> {
    return new IO(new Async((contextSwitch) => {
      // We just need an abort implementation to indicate it is possible
      contextSwitch.setAbort(() => {
        return;
      });
    }));
  }

  /**
   * Construct an IO from a promise.
   *
   * The resulting IO is uncancellable due to standard promise semantics.
   * If you want cancellation and are using a library that supports it like bluebird,
   * you need to roll your own converter using async
   * @param thunk
   */
  public static assimilate<A>(thunk: () => Promise<A>): IO<unknown, A> {
    return IO.async<unknown, A>((contextSwitch) => {
      thunk().then((v) => contextSwitch.resume(new Value(v))).catch((e) => contextSwitch.resume(new Raise(e)));
    });
  }

  private constructor(public readonly step: IOStep<E | never, A | never>) {}

  public map<B>(f: (a: A) => B): IO<E, B> {
    return this.chain((a) => new IO(new Of(f(a))));
  }

  /**
   * Apply f to the result of both this and fb when run in sequence.
   * @param fb
   * @param f
   */
  public map2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    return this.chain((a) => fb.map((b) => f(a, b)));
  }

  public mapError<F>(f: (e: E) => F): IO<F, A> {
    return this.chainError((e) => IO.failed(f(e)));
  }

  /**
   * Apply f to the result of both this and fb run in parallel
   * @param fb
   * @param f
   */
  public parMap2<B, C>(fb: IO<E, B>, f: (a: A, b: B) => C): IO<E, C> {
    // Go through deferreds for the purposes of stack safety
    // Deferred has the property of ensuring the stack is unwound on wait and this is desirable
    return Deferred.alloc<A>().widenError<E>().chain((leftInto) =>
      Deferred.alloc<B>().widenError<E>().chain((rightInto) =>
        this.fork().widenError<E>().bracket((fiba) => fiba.interrupt, (fiba) =>
          fb.fork().widenError<E>().bracket((fibb) => fibb.interrupt, (fibb) =>
            fiba.join.tap((v) => leftInto.fill(v).widenError<E>())
              .applySecond(fibb.join.tap((v) => rightInto.fill(v).widenError<E>()))
          )
        )
        .applySecond(leftInto.wait.map2(rightInto.wait, f).widenError<E>())
      )
    );
  }

  /**
   * Apply the function produced by fab to the result of this after both fab and this are run in sequence
   * @param fab
   */
  public ap<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.map2(fab, (a, f) => f(a));
  }

  /**
   * Apply the function produced by this to the result of fb
   * @param this
   * @param fb
   */
  public ap_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>): IO<E, C> {
    return this.map2(fb, (f, b) => f(b));
  }

  /**
   * Apply the function produced by fab to the result of this after both fab and this are run in parallel.
   * @param fab
   */
  public parAp<B>(fab: IO<E, (a: A) => B>): IO<E, B> {
    return this.parMap2(fab, (a, f) => f(a));
  }

  public parAp_<B, C>(this: IO<E, (b: B) => C>, fb: IO<E, B>): IO<E, C> {
    return this.parMap2(fb, (f, b) => f(b));
  }

  /**
   * Run this and fb in sequence and take the result of this.
   * @param fb
   */
  public applyFirst<B>(fb: IO<E, B>): IO<E, A> {
    return this.map2(fb, (a, _) => a);
  }

  /**
   * Run this and fb in parallel and take the result of this.
   *
   * If either fail which error is produced is undefined
   * @param fb
   */
  public parApplyFirst<B>(fb: IO<E, B>): IO<E, A> {
    return this.parMap2(fb, (a, _) => a);
  }

  /**
   * Run this and fb in sequence and take the result of fb
   * @param fb
   */
  public applySecond<B>(fb: IO<E, B>): IO<E, B> {
    return this.map2(fb, (_, b) => b);
  }

  /**
   * Run this and fb in parallel and take the result of fb
   * @param fb
   */
  public parApplySecond<B>(fb: IO<E, B>): IO<E, B> {
    return this.parMap2(fb, (_, b) => b);
  }

  /**
   * Run this and fb in sequence and produce a tuple of their results.
   * @param fb
   */
  public product<B>(fb: IO<E, B>): IO<E, [A, B]> {
    return this.map2(fb, (a, b) => [a, b] as [A, B]);
  }

  /**
   * Run this and fb in parallel and produce a tuple of their results.
   * @param fb
   */
  public parProduct<B>(fb: IO<E, B>): IO<E, [A, B]> {
    return this.parMap2(fb, (a, b) => [a, b] as [A, B]);
  }

  /**
   * Flatten an IO<E, IO<E, A>> into an IO<E, A>
   * @param this
   */
  public flatten<AA>(this: IO<E, IO<E | never, AA>>): IO<E, AA> {
    return this.chain((io) => io);
  }

  public tap<B>(f: (a: A) => IO<E, B>): IO<E, A> {
    return this.chain((a) => f(a).as(a));
  }

  public tapError<B>(f: (e: E) => IO<never, B>): IO<E, A> {
    return this.chainError((e) => f(e).widenError<E>().applySecond(IO.failed(e)));
  }

  public tapCause<B>(f: (cause: Cause<E>) => IO<never, B>): IO<E, A> {
    return this.chainCause((cause) => f(cause).widenError<E>().applySecond(IO.caused(cause)));
  }

  public chain<B>(f: (a: A) => IO<E, B>): IO<E, B> {
    return new IO(new Chain(this, f));
  }

  /**
   * Run this and if an error is produced, attempt to recover using f.
   *
   * More powerful version of chainError which provides the full Cause.
   * This allows trapping Aborts as well as seeing any nested errors in Cause.
   * @param this
   * @param f
   */
  public chainCause<EE>(f: (cause: Cause<E>) => IO<EE, A>): IO<EE, A> {
    return new IO(new ChainError(this, f));
  }

  /**
   * Run this and if an error is produced, attempt to recover using f.
   * @param this
   * @param f
   */
  public chainError<EE>(f: (e: E) => IO<EE, A>): IO<EE, A> {
    return this.chainCause((cause) => cause._tag === "raise" ? f(cause.error) : IO.caused(cause));
  }

  /**
   * Run this and produce either a Value<A> or a Raise<E> depending on the result
   */
  public attempt(): IO<never, Attempt<E, A>> {
    return this.map<Attempt<E, A>>((v) => new Value(v))
      .chainCause((cause) => cause._tag === "raise" ? IO.of(cause) : IO.caused(cause));
  }

  /**
   * Run this and trap all exit cases lifting the Result into the value.
   */
  public resurrect(): IO<never, Result<E, A>> {
    return this.map<Result<E, A>>((v) => new Value(v))
      .chainCause((cause) => IO.of(cause));
  }

  /**
   * Inverse of resurrect which submerges a Result back into the IO
   * @param this
   */
  public slay<EE, AA>(this: IO<never, Result<EE, AA>>): IO<EE, AA> {
    return this.widenError<EE>()
      .chain((result) => result._tag === "value" ? IO.pure(result.value) : IO.caused(result));
  }

  /**
   * Execute this action forever (or until interrupted)
   */
  public forever(): IO<E, never> {
    return this.chain((_) => this.forever());
  }

  public repeat(count: number): IO<E, A> {
    if (count === 0) {
      return IO.aborted(new Abort(new Error("Cannot repeat less than 1 time"))) as unknown as IO<E, A>;
    } else if (count === 1) {
      return this;
    } else {
      return this.chain((_) => this.repeat(count - 1));
    }
  }

  /**
   * Ensure that once the returned IO has begun executing always will always be executed
   * regardless of error or interrupt.
   *
   * It is important to note that 'begun executing' refers to the IO action being next to execute
   * for the runloop. It is theoretically possible for the returned IO to be 'begun' executing
   * (and thus always be registered as a cleanup action) without 'this' IO every actually starting.
   * This is an interaction between asynchronous boundaries and critical sections, but you must account for it.
   * @param always
   */
  public ensuring<B>(always: IO<never, B>): IO<E, A> {
    return new IO(new OnDone(this, always));
  }

  /*
   * Ensure that once the returned IO has begun executing interrupt will be executed in the face of interrupt.
   *
   * It is important to note that 'begun executing' refers to the IO action being next to execute
   * for the runloop. It is theoretically possible for the returned IO to be 'begun' executing
   * (and thus always be registered as a cleanup action) without 'this' IO every actually starting.
   * This is an interaction between asynchronous boundaries and critical sections, but you must account for it.
   */
  public interrupted<B>(interrupt: IO<never, B>): IO<E, A> {
    return new IO(new OnInterrupted(this, interrupt));
  }

  /**
   * A resource management construct.
   *
   * Treat this as an action producing a resource. If this is successful, guaranteee that the IO produced by
   * release will be executed following the IO produced by consume even on error or interrupt.
   * this is always uninterruptible
   * @param release a function producing a resource release IO
   * @param consume a function producing the IO to continue with
   */
  public bracket<B>(release: (a: A) => IO<never, void>, consume: (a: A) => IO<E, B>): IO<E, B> {
    return Ref.alloc<IO<never, void>>(IO.void())
      .widenError<E>()
      .chain((ref) =>
        // Resource acquisition and setting of the ref is critical
        this.chain((r) => ref.set(release(r)).as(r).widenError<E>()).critical()
          .chain(consume)
          .ensuring(ref.get.flatten())
      );
  }

  /**
   * A resource management construct
   *
   * Treat this action as producgina resource.
   * If this is successful, the release will always be executed following the IO produced by consume
   * even on error or interrupt.
   * The release and acquisition are critical sections
   * @param release
   * @param consume
   */
  public bracketExit<B>(release: (a: A, result: FiberResult<E, B>) => IO<never, void>,
                        consume: (a: A) => IO<E, B>): IO<E, B> {
    return Ref.alloc<IO<never, void>>(IO.void())
      .widenError<E>()
      .chain((cleanup) =>
        this
        .chain((resource) =>
          consume(resource).fork().widenError<E>()
            .tap((fib) =>
              cleanup.set(fib.interruptAndWait
                .chain((result) => release(resource, result))).widenError<E>())).critical()
        .chain((fib) => fib.join)
        .ensuring(cleanup.get.flatten())
      );
  }

  /**
   * A weaker form of use that does not provide the resource to the continuation
   * Used for cases where the inner effect may depends on the effects of the resource acquisition/release
   * But not the resource itself
   * @param release
   * @param inner
   */
  public within<B>(release: (a: A) => IO<never, void>, inner: IO<E, B>): IO<E, B> {
    return this.bracket(release, (_) => inner);
  }

  /**
   * Widen the result type.
   *
   * Does nothing and hopefully gets inlined.
   * There are a few edge cases where 'casting' is useful and this provides a controlled variant
   * @param this
   */
  public widen<AA>(this: IO<E, A extends AA ? AA : never>): IO<E, AA> {
    return this as unknown as IO<E, AA>;
  }

  /**
   * Widen the error type.
   *
   * Does nothing and hopefully gets inlined.
   * There are a few edge cases where 'casting' is useful and this provides a controlled variant
   * @param this
   */
  public widenError<EE>(this: IO<E extends EE ? EE : never, A>): IO<EE, A> {
    return this as unknown as IO<EE, A>;
  }

  /**
   * Produce an IO that succeeds with void if this IO succeeds with a value
   */
  public void(): IO<E, void> {
    return this.map((_) => { return; });
  }

  /**
   * Produce an IO that succeeds with b if this IO succeeds with a value.
   * @param b
   */
  public as<B>(b: B): IO<E, B> {
    return this.map((_) => b);
  }

  /**
   * Race this with other. The first result, either success or failure is taken
   * @param other
   */
  public race(other: IO<E, A>): IO<E, A> {
    return Deferred.alloc<Result<E, A>>()
      .chain((deferred) =>
        raceInto(deferred, this)
          .within((fiba) => fiba.interrupt, raceInto(deferred, other)
            .within((fibb) => fibb.interrupt, deferred.wait)))
      .slay();
  }

  /**
   * Race this with other producing which result was used. The first result either success or failure is taken.
   * @param other
   */
  public raceOneOf<B>(other: IO<E, B>): IO<E, Either<A, B>> {
    return this.map<Either<A, B>>(left)
      .race(other.map<Either<A, B>>(right));
  }

  /**
   * Run this IO with a timeout.
   *
   * If this succeeds before the timeout, produces an A,
   * otherwise, interrupts this and produces undefined
   * @param millis
   */
  public timeout(millis: number): IO<E, Option<A>> {
    return this.raceOneOf(IO.delay(millis).widenError<E>())
      .map((result) => result.fold(some, (_) => none));
  }

  /**
   * Delay the execution of this IO by some time.
   * @param millis
   */
  public delay(millis: number): IO<E, A> {
    return IO.async<E, void>((contextSwitch) => {
      const id = setTimeout(() => {
        contextSwitch.resume(new Value(undefined));
      }, millis);
      return () => {
        clearTimeout(id);
      };
    }).applySecond(this);
  }

  /**
   * Introduce an asynchronous boundary before the execution of this
   */
  public yield_(): IO<E, A> {
    return this.delay(0);
  }

  /**
   * Construct an IO that is the uncancellable version of this
   */
  public critical(): IO<E, A> {
    return new IO(new Critical(this));
  }

  /**
   * Lifts branching into IO. If this evaluates to true will then evaluate the ifTrue IO
   * otherwise evaluate the ifFalse IO.
   * @param this
   * @param ifTrue
   * @param ifFalse
   */
  public branch<AA>(this: IO<E, boolean>, ifTrue: IO<E, AA>, ifFalse: IO<E, AA>): IO<E, AA> {
    return this.chain((isTrue) => isTrue ? ifTrue : ifFalse);
  }

  /**
   * Only perform this action if the test action evaluats to true.
   * @param test
   */
  public when(test: IO<E, boolean>): IO<E, void> {
    return test.branch<void>(this.void(), IO.void());
  }

  /**
   * Produce an IO that when run will spawn this as a fiber.
   */
  public fork(): IO<never, Fiber<E, A>> {
    return IO.eval(() => {
      const runtime = new Runtime<E, A>();
      setTimeout(() => {
        runtime.start(this);
      });
      return new Fiber(runtime);
    }); // Yield. This prevents spawning many fibers in through folding from consume stack
  }

  /**
   * Run this.
   *
   * Accepts an optional callback that receives the result of the runtime.
   * Returns a function that can be used to interrupt.
   *
   * @param callback
   */
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

  /**
   * Run this and return a promise of the result.
   *
   * Rejects if this produces a Raise or an Abort.
   * Does not resolve if the runtime is interrupted.
   * However, given that the runtime is not exposed, this is not a problem as of yet.
   *
   */
  public promised(): Promise<A> {
    return new Promise((resolve, reject) => {
      const runtime = new Runtime<E, A>();
      runtime.result.listen((result) => {
        if (result._tag === "value") {
          resolve(result.value);
        } else if (result._tag === "raise" || result._tag === "abort") {
          return reject(result.error);
        }
        // Don't resolve for interrupts
      });
      runtime.start(this);
    });
  }

  /**
   * Run this and return a promise of the result.
   *
   * Resolves with the result of the fiber.
   * Never rejects.
   */
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
    .chain((result) => defer.tryFill(result).void())
    .fork();
}

/**
 * Connection to the runloop for delivering asynchronous values
 */
export interface ContextSwitch<E, A> {
  /**
   * Deliver a value immediately to a suspended runloop.
   * Once this value is delivered, the runloop is guaranteed to execute at least 1 IO action.
   * @param result
   */
  resume(result: Result<E, A>): void;
  /**
   * Deliver a value after a short delay to a suspended runloop.
   * The runloop is uninterruptible during this waiting period and is
   * guaranteed to execute at least 1 IO action.
   *
   * Prefer #{@link deliver} unless you have a reason
   * @param result
   */
  resumeLater(result: Result<E, A>): void;
   /**
    * Provide cancellation logic.
    *
    * If this is provided during the async call then interuption of the asynchronous element is possible.
    * @param abort
    */
  setAbort(abort: () => void): void;
}
