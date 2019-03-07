// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Either, left, right } from "fp-ts/lib/Either";
import { Deferred } from "./deferred";
import { Dequeue } from "./internal/dequeue";
import { Ticket } from "./internal/ticket";
import { IO, UIO } from "./io";
import { Ref } from "./ref";
import { Abort } from "./result";

// State is either a list of waits or the amount remaining
type Reservation = [number, Deferred<void>];
type State = Either<Dequeue<Reservation>, number>;

function sanityCheck(permits: number): IO<never, void> {
  if (permits < 0) {
    return IO.aborted(new Abort(new Error("Bug: permits may not be negative")));
  } else if (Math.round(permits) !== permits) {
    return IO.aborted(new Abort(new Error("Bug: permits must be integers")));
  }
  return IO.void();
}
/**
 * Semaphore for IO
 */
export class Semaphore {
  /**
   * Create a new semaphore with the given number of permits
   * @param  permits The number of permits the semaphore should start with
   * @return         [description]
   */
  public static alloc(permits: number): IO<never, Semaphore> {
    return sanityCheck(permits).applySecond(Ref.alloc<State>(right(permits)))
      .map((sref) => new Semaphore(sref));
  }

  public static unsafeAlloc(permits: number): Semaphore {
    if (permits < 0) {
      throw new Error("Bug: permits may not be negative");
    }
    if (Math.round(permits) !== permits) {
      throw new Error("Bug: permits may not be negative");
    }
    return new Semaphore(Ref.unsafeAlloc(right(permits)));
  }

  public readonly acquire: IO<never, void> = this.acquireN(1);
  public readonly release: IO<never, void> = this.releaseN(1);
  public readonly count: IO<never, number> = this.state.get
    .map(countPermits);

  private constructor(private readonly state: Ref<State>) { }

  public withPermitsN<E, A>(permits: number, io: IO<E, A>): IO<E, A> {
    return this.acquireN(permits)
      .widenError<E>()
      .applySecond(io.ensuring(this.releaseN(permits)));
  }

  public withPermit<E, A>(io: IO<E, A>): IO<E, A> {
    return this.withPermitsN(1, io);
  }

  public acquireN(permits: number): IO<never, void> {
    return sanityCheck(permits)
      .applySecond(ticketN(this, permits, this.state).bracketExit(Ticket.cleanup, (ticket) => ticket.wait));
  }

  public releaseN(permits: number): IO<never, void> {
    return sanityCheck(permits)
      .applySecond(permits === 0 ?
        IO.void() :
        this.state.modify((current) =>
          current.fold<[IO<never, void>, State]>(
            (waiting) => {
              const [pending, next] = waiting.dequeue();
              if (pending) {
                const [needed, gate] = pending;
                if (needed >= permits) {
                  return [
                    gate.fill(undefined)
                      .applyFirst(permits > needed ? this.releaseN(permits - needed) : IO.void()),
                    left(next) as State
                  ];
                }
                return [
                  IO.void(),
                  left(next.enqueueFront([needed - permits, gate])) as State
                ];
              }
              return [IO.void(), right(permits)];
            },
            (available) => [IO.void(), right(available + permits) as State]
          )
        ).flatten().critical());
  }
}

function countPermits(state: State): number {
  return state.fold(
    // Javascript has a -0 and it breaks chai deep equals
    (waiting) => waiting.empty ? 0 : -1 * waiting.length,
    (available) => available
  );
}

function ticketN(sem: Semaphore,
                 permits: number,
                 state: Ref<Either<Dequeue<Reservation>, number>>): IO<never, Ticket<void>> {
  // We need to go into the queue and remove all permits we can infer were allocated and remove the reservation
  function unqueue(gate: Deferred<void>): IO<never, void> {
    return state.modify((current) =>
      current.fold<[IO<never, void>, State]>(
        (waiting) => {
          const reserved = waiting.array.find((rsv) => rsv[1] === gate);
          if (reserved) {
            const pending = reserved[0];
            const filtered = Dequeue.ofAll(waiting.array.filter((rsv) => rsv[1] !== gate));
            return [sem.releaseN(permits - pending), left(filtered)];
          }
          // Not in queue, release everything
          return [sem.releaseN(permits), left(waiting)];
        },
        // Not in queue, release everything
        (available) => [sem.releaseN(permits), right(available)]
      )
    ).flatten().critical();
  }

  if (permits === 0) {
    return IO.of(new Ticket(IO.void(), IO.void()));
  } else {
    return Deferred.alloc<void>().chain((gate) =>
      state.modify((current) =>
        current.fold<[Ticket<void>, State]>(
          (waiting) => [new Ticket(gate.wait, unqueue(gate)), left(waiting.enqueue([permits, gate]))],
          (available) => available >= permits ?
            [new Ticket(IO.void(), sem.releaseN(permits)), right(available - permits) as State] :
            [new Ticket(gate.wait, unqueue(gate)), left(Dequeue.of([permits - available, gate])) as State]
        )
      )
    );
  }
}
