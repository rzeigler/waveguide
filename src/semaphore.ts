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

import { Either, left, right } from "fp-ts/lib/Either";
import { constant, identity, not } from "fp-ts/lib/function";
import { Deferred, makeDeferredC, makeDeferred } from "./deferred";
import { abort, bracketC, bracketExitC, IO, io, unit } from "./io";
import { makeRef as allocRef, Ref } from "./ref";
import { Dequeue, dequeue } from "./support/dequeue";
import { Ticket, ticketExit, ticketUse } from "./ticket";

export interface Semaphore {
  readonly acquire: IO<never, void>;
  readonly release: IO<never, void>;
  readonly available: IO<never, number>;

  acquireN(n: number): IO<never, void>;
  releaseN(n: number): IO<never, void>;
  withPermitsN<E, A>(n: number, io: IO<E, A>): IO<E, A>;
  withPermit<E, A>(n: IO<E, A>): IO<E, A>;
}

type Reservation = readonly [number, Deferred<never, void>];
type State = Either<Dequeue<Reservation>, number>;

class SemaphoreImpl implements Semaphore {
  public readonly acquire: IO<never, void>;
  public readonly release: IO<never, void>;
  public readonly available: IO<never, number>;

  constructor(private readonly cell: Ref<State>) {
    this.acquire = this.acquireN(1);
    this.release = this.releaseN(1);
    this.available = this.cell.get
      .map((current) => current.fold(
        (q) => -1 * q.size(),
        identity
      ));
  }

  public acquireN<E = never>(n: number): IO<E, void> {
    return sanityCheck(n)
      .applySecond(n === 0 ? unit : bracketExitC(this.ticketN(n))(ticketExit, ticketUse));
  }

  public releaseN<E = never>(n: number): IO<E, void> {
    return sanityCheck(n)
      .applySecond(n === 0 ? unit :
        this.cell.modify(
          (current) =>
            current.fold<readonly [IO<never, void>, State]>(
              (waiting) => waiting.take()
                .foldL(
                  () => [unit, right(n) as State] as const,
                  ([[needed, latch], q]) => n >= needed ?
                    [
                      latch.succeed(undefined).applyFirst(n > needed ? this.releaseN(n - needed) : unit),
                      left(q) as State
                    ] as const :
                    [
                      unit,
                      left(q.push([needed - n, latch] as const)) as State
                    ] as const
                ),
              (available) => [unit, right(available + n) as State] as const
            )
        ).flatten().uninterruptible());
  }

  public withPermitsN<E, A>(n: number, inner: IO<E, A>): IO<E, A> {
    return bracketC(this.acquireN<E>(n).interruptible())
      (constant(this.releaseN(n)), (_) => inner);
  }

  public withPermit<E, A>(inner: IO<E, A>): IO<E, A> {
    return this.withPermitsN(1, inner);
  }

  private ticketN(n: number): IO<never, Ticket<void>> {
    return makeDeferred<never, void>()
      .chain((latch) =>
        this.cell.modify(
          (current) =>
            current.fold<readonly [Ticket<void>, State]>(
              (waiting) => [
                new Ticket(latch.wait, this.cancelWait(n, latch)),
                left(waiting.offer([n, latch] as const)) as State
              ] as const,
              (available) => available >= n ?
                [
                  new Ticket(unit, this.releaseN(n)),
                  right(available - n) as State
                ] as const :
                [
                  new Ticket(latch.wait, this.cancelWait(n, latch)),
                  left(dequeue.empty().offer([n - available, latch] as const)) as State
                ] as const
            )
        )
      );
  }

  private cancelWait(n: number, latch: Deferred<never, void>): IO<never, void> {
    return this.cell.modify((current) =>
      current.fold<readonly [IO<never, void>, State]>(
        (waiting) =>
          waiting.find(isReservationFor(latch))
            .foldL(
              () => [this.releaseN(n), left(waiting) as State] as const,
              ([pending]) => [
                this.releaseN(n - pending),
                left(waiting.filter(not(isReservationFor(latch)))) as State
              ] as const
            ),
          (available) => [unit, right(available + n) as State] as const
      )
    ).flatten().uninterruptible();
  }
}

const isReservationFor = (latch: Deferred<never, void>) => (rsv: readonly [number, Deferred<never, void>]): boolean =>
  rsv[1] === latch;

function sanityCheck(n: number): IO<never, void> {
  if (n < 0) {
    return abort(new Error("Die: semaphore permits must be non negative"));
  }
  if (Math.round(n) !== n) {
    return abort(new Error("Die: semaphore permits may not be fractional"));
  }
  return unit;
}

/**
 * Allocate a semaphore.
 *
 * @param n the number of permits
 * This must be non-negative
 */
export function makeSemaphore(n: number): IO<never, Semaphore> {
  return sanityCheck(n)
    .applySecond(allocRef<State>(right(n))
    .map((state) => new SemaphoreImpl(state)));
}
