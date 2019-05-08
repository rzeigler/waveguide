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
import { IO, io } from "../core/io";
import { Dequeue, dequeue } from "../support/dequeue";
import { Deferred, deferred } from "./deferred";
import { Ref, ref } from "./ref";
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
      .applySecond(n === 0 ? io.unit : io.bracketExitC(this.ticketN(n))(ticketExit, ticketUse));
  }

  public releaseN<E = never>(n: number): IO<E, void> {
    return sanityCheck(n)
      .applySecond(n === 0 ? io.unit :
        this.cell.modify(
          (current) =>
            current.fold<readonly [IO<never, void>, State]>(
              (waiting) => waiting.take()
                .foldL(
                  () => [io.unit, right(n) as State] as const,
                  ([[needed, latch], q]) => n >= needed ?
                    [
                      latch.succeed(undefined).applyFirst(n > needed ? this.releaseN(n - needed) : io.unit),
                      left(q) as State
                    ] as const :
                    [
                      io.unit,
                      left(q.push([needed - n, latch] as const)) as State
                    ] as const
                ),
              (available) => [io.unit, right(available + n) as State] as const
            )
        ).flatten().uninterruptible());
  }

  public withPermitsN<E, A>(n: number, inner: IO<E, A>): IO<E, A> {
    return io.bracketC(this.acquireN<E>(n).interruptible())
      (constant(this.releaseN(n)), (_) => inner);
  }

  public withPermit<E, A>(inner: IO<E, A>): IO<E, A> {
    return this.withPermitsN(1, inner);
  }

  private ticketN(n: number): IO<never, Ticket<void>> {
    return deferred.allocC()()
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
                  new Ticket(io.unit, this.releaseN(n)),
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
          (available) => [io.unit, right(available + n) as State] as const
      )
    ).flatten().uninterruptible();
  }
}

const isReservationFor = (latch: Deferred<never, void>) => (rsv: readonly [number, Deferred<never, void>]): boolean =>
  rsv[1] === latch;

function sanityCheck(n: number): IO<never, void> {
  if (n < 0) {
    return io.abort(new Error("Die: semaphore permits must be non negative"));
  }
  if (Math.round(n) !== n) {
    return io.abort(new Error("Die: semaphore permits may not be fractional"));
  }
  return io.unit;
}

function alloc(n: number): IO<never, Semaphore> {
  return sanityCheck(n)
    .applySecond(ref.alloc<State>(right(n))
    .map((state) => new SemaphoreImpl(state)));
}

export const semaphore = {
  alloc
} as const;
