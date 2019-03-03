// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Deferred } from "./deferred";
import { IO, UIO } from "./io";
import { Dequeue } from "./queue";
import { Ref } from "./ref";
import { Abort, FiberResult, First, OneOf, Second } from "./result";
import { terminal } from "./terminal";

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

class Ticket {
  constructor(public readonly wait: IO<never, void>, public readonly restore: IO<never, void>) { }
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
    const cleanup = (ticket: Ticket, result: FiberResult<never, void>): IO<never, void> =>
      result._tag === "interrupted" ? ticket.restore : IO.void();

    return sanityCheck(permits)
      .applySecond(ticketN(this, permits, this.state).bracketExit(cleanup, (ticket) => ticket.wait));
  }

  public releaseN(permits: number): IO<never, void> {
    return sanityCheck(permits)
      .applySecond(permits === 0 ?
        IO.void() :
        this.state.modify((current) => {
          if (current._tag === "second") {
            return [IO.void(), new Second(current.second + permits)];
          }
          const [pending, nextQueue] = current.first.dequeue();
          if (pending) {
            const [needed, gate] = pending;
            if (needed >= permits) {
              return [
                (permits > needed ? this.releaseN(permits - needed) : IO.void())
                  .applySecond(gate.fill(undefined)),
                new First(nextQueue)
              ];
            }
            return [
              IO.void(),
              new First(nextQueue.enqueueFront([needed - permits, gate]))
            ];
          }
          // We have 0 permits because we had an empty queue
          return [IO.void(), new Second(permits)];
        }).flatten()).critical();
  }
}

function countPermits(state: State): number {
  if (state._tag === "first") {
    // Javascript has a -0 and it breaks chai deep equals
    if (state.first.empty) {
      return 0;
    }
    return -1 * state.first.array.map((p) => p[0])
      .reduce((p, c) => p + c, 0);
  }
  return state.second;
}

function ticketN(sem: Semaphore, permits: number, state: Ref<OneOf<Dequeue<Reservation>, number>>): IO<never, Ticket> {
  // We need to go into the queue and remove all permits we can infer were allocated and remove the reservation
  function unqueue(gate: Deferred<void>): UIO<void> {
    return state.modify((current) => {
      // Not in the queue, release all tickets
      if (current._tag === "second") {
        return [sem.releaseN(permits), new Second(current.second + permits) as State];
      }
      const reserved = current.first.array.find((rsv) => rsv[1] === gate);
      // Found in the queue, release permits - pending and remove the gate from the queu
      if (reserved) {
        const [pending] = reserved;
        const filtered = Dequeue.ofAll(current.first.array.filter((rsv) => rsv[1] !== gate));
        return [sem.releaseN(permits - pending), new First(filtered) as State];
      }
      // Not found in the queue, release all the ticket
      return [sem.releaseN(permits), current as State];
    }).flatten().critical();
  }

  if (permits === 0) {
    return IO.of(new Ticket(IO.void(), IO.void()));
  } else {
    return Deferred.alloc<void>().chain((gate) =>
      state.modify((current) => {
        if (current._tag === "second" && current.second >= permits) {
          return [new Ticket(IO.void(), sem.releaseN(permits)),
                  new Second(current.second - permits) as State];
        }
        if (current._tag === "second") {
          return [new Ticket(gate.wait, unqueue(gate)),
                  new First(Dequeue.of([permits - current.second, gate])) as State];
        }
        return [new Ticket(gate.wait, unqueue(gate)),
                new First(current.first.enqueue([permits, gate])) as State];
      })
    );
  }
}
