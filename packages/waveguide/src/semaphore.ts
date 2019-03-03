import { Deferred } from "./deferred";
import { IO } from "./io";
import { Dequeue } from "./queue";
import { Ref } from "./ref";
import { Abort, First, OneOf, Second } from "./result";

// State is either a list of waits or the amount remaining
type Reservation = [number, Deferred<void>];
type State = OneOf<Dequeue<Reservation>, number>;

function sanityCheck(permits: number): IO<never, void> {
  if (permits < 0) {
    return IO.aborted(new Abort(new Error("Bug: permits may not be negative")));
  } else if (Math.round(permits) !== permits) {
    return IO.aborted(new Abort(new Error("Bug: permits must be integers")));
  }
  return IO.void();
}

class Acquire {
  constructor(public readonly wait: IO<never, void>, public readonly restore: IO<never, void>) { }
}

/**
 * Semaphore for IO
 * Based loosely on
 * https://github.com/scalaz/scalaz-zio/blob/master/core/shared/src/main/scala/scalaz/zio/Semaphore.scala
 */
export class Semaphore {
  /**
   * Create a new semaphore with the given number of permits
   * @param  permits The number of permits the semaphore should start with
   * @return         [description]
   */
  public static alloc(permits: number): IO<never, Semaphore> {
    return sanityCheck(permits).applySecond(Ref.alloc(new Second(permits)))
      .map((sref) => new Semaphore(sref));
  }

  public static unsafeAlloc(permits: number): Semaphore {
    if (permits < 0) {
      throw new Error("Bug: permits may not be negative");
    }
    if (Math.round(permits) !== permits) {
      throw new Error("Bug: permits may not be negative");
    }
    return new Semaphore(Ref.unsafeAlloc(new Second(permits)));
  }

  public readonly acquire: IO<never, void> = this.acquireN(1);
  public readonly release: IO<never, void> = this.releaseN(1);
  public readonly count: IO<never, number> = this.ref.get
    .map(count);

  private constructor(private readonly ref: Ref<State>) { }

  public withPermitsN<E, A>(permits: number, io: IO<E, A>): IO<E, A> {
    return this.acquireN(permits)
      .widenError<E>()
      .applySecond(io.ensuring(this.releaseN(permits)));
  }

  public withPermit<E, A>(io: IO<E, A>): IO<E, A> {
    return this.withPermitsN(1, io);
  }

  public acquireN(permits: number): IO<never, void> {
    /* Construct an IO action that will block the calling fiber appropriately*/

    return sanityCheck(permits);
  }

  public releaseN(permits: number): IO<never, void> {
    const release = (remaining: number): IO<never, void> => {
      // We release everything so we are done
      if (remaining === 0) {
        return IO.void();
      } else {
        return this.ref.get
          .chain((state) => {
            // We have a queue so we should check if things can be advanced
            if (state._tag === "first") {
              const [next, queue] = state.first.take();
              // There is something pending so we should provide it with permits
              if (next) {
                // We have exactly the right amount of permits being returned so
                // set the queue then release the block.
                if (remaining === next[0]) {
                  return this.ref.set(new First(queue)).applySecond(next[1].fill(undefined));
                // We have more permits than we need so release the blocked fiber and then release more
                } else if (remaining >= next[0]) {
                  return this.ref.set(new First(queue)).applySecond(next[1].fill(undefined))
                    .applySecond(release(remaining - next[0]));
                } else {
                  // We don't have enough permits to release the blocked fiber
                  // put provide it with some permits
                  return this.ref.set(new First(queue.push([next[0] - remaining, next[1]])));
                }
              } else {
                // There is nothing in queue so we now have remaining permits to set
                return this.ref.set(new Second(remaining));
              }
            } else {
              // We can add permits to the ones we already have
              return this.ref.set(new Second(state.second + remaining));
            }
          });
      }
    };
    return sanityCheck(permits)
      .applySecond(release(permits));
  }
}

function count(state: State): number {
  if (state._tag === "first") {
    return -1 * state.first.array.map((p) => p[0])
      .reduce((p, c) => p + c, 0);
  }
  return state.second;
}
