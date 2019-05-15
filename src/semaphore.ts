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
import { Deferred, makeDeferred } from "./deferred";
import { abort, bracketC, bracketExitC, IO, unit } from "./io";
import { makeRef as allocRef, Ref } from "./ref";
import { Dequeue, empty } from "./support/dequeue";
import { makeTicket, Ticket, ticketExit, ticketUse } from "./ticket";

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

function makeSemaphoreImpl(ref: Ref<State>): Semaphore {
  const cancelWait = (n: number, latch: Deferred<never, void>): IO<never, void> =>
    ref.modify((current) =>
      current.fold<readonly [IO<never, void>, State]>(
        (waiting) =>
          waiting.find(isReservationFor(latch))
            .foldL(
              () => [releaseN(n), left(waiting) as State] as const,
              ([pending]) => [
                releaseN(n - pending),
                left(waiting.filter(not(isReservationFor(latch)))) as State
              ] as const
            ),
        (ready) => [unit, right(ready + n) as State] as const
      )
    ).flatten().uninterruptible();

  const ticketN = (n: number): IO<never, Ticket<void>> =>
    makeDeferred<never, void>()
      .chain((latch) =>
        ref.modify(
          (current) =>
            current.fold<readonly [Ticket<void>, State]>(
              (waiting) => [
                makeTicket(latch.wait, cancelWait(n, latch)),
                left(waiting.offer([n, latch] as const)) as State
              ] as const,
              (ready) => ready >= n ?
                [
                  makeTicket(unit, releaseN(n)),
                  right(ready - n) as State
                ] as const :
                [
                  makeTicket(latch.wait, cancelWait(n, latch)),
                  left(empty().offer([n - ready, latch] as const)) as State
                ] as const
            )
        )
      );

  const acquireN = <E = never>(n: number): IO<E, void> =>
    sanityCheck(n)
      .applySecond(n === 0 ? unit : bracketExitC(ticketN(n))(ticketExit, ticketUse));

  const releaseN = <E = never>(n: number): IO<E, void> =>
    sanityCheck(n)
      .applySecond(n === 0 ? unit :
        ref.modify(
          (current) =>
            current.fold<readonly [IO<never, void>, State]>(
              (waiting) => waiting.take()
                .foldL(
                  () => [unit, right(n) as State] as const,
                  ([[needed, latch], q]) => n >= needed ?
                    [
                      latch.succeed(undefined).applyFirst(n > needed ? releaseN(n - needed) : unit),
                      left(q) as State
                    ] as const :
                    [
                      unit,
                      left(q.push([needed - n, latch] as const)) as State
                    ] as const
                ),
              (ready) => [unit, right(ready + n) as State] as const
            )
        ).flatten().uninterruptible());

  const withPermitsN = <E, A>(n: number, inner: IO<E, A>): IO<E, A> =>
    bracketC(acquireN<E>(n).interruptible())(constant(releaseN(n)), (_) => inner);

  const available = ref.get
    .map((current) => current.fold(
      (q) => -1 * q.size(),
      identity
    ));

  return {
    acquireN,
    acquire: acquireN(1),
    releaseN,
    release: releaseN(1),
    withPermitsN,
    withPermit: (inner) => withPermitsN(1, inner),
    available
  };
}

/**
 * Allocate a semaphore.
 *
 * @param n the number of permits
 * This must be non-negative
 */
export function makeSemaphore(n: number): IO<never, Semaphore> {
  return sanityCheck(n)
    .applySecond(allocRef<State>(right(n)))
    .map(makeSemaphoreImpl);
}
