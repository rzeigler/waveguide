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

import { Either, fold, left, right } from "fp-ts/lib/Either";
import { FunctionN, identity } from "fp-ts/lib/function";
import { getOrElse, option } from "fp-ts/lib/Option";
import { pipe, pipeable } from "fp-ts/lib/pipeable";
import { Deferred, makeDeferred } from "./deferred";
import { IO, succeed, unit } from "./io";
import { makeRef, Ref } from "./ref";
import { natNumber } from "./sanity";
import { makeSemaphore } from "./semaphore";
import { Dequeue, empty, of } from "./support/dequeue";
import { makeTicket, ticketExit, ticketUse } from "./ticket";

export interface ConcurrentQueue<A> {
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

type State<A> = Either<Dequeue<Deferred<never, A>>, Dequeue<A>>;
const initial = <A>(): State<A> => right(empty());

const poption = pipeable(option);

const unboundedOffer = <A>(queue: Dequeue<A>, a: A): Dequeue<A> => queue.offer(a);

const slidingOffer = (n: number) => <A>(queue: Dequeue<A>, a: A): Dequeue<A> =>
  queue.size() >= n ?
    pipe(queue.take(),
      poption.map((t) => t[1]),
      getOrElse(() => queue))
      .offer(a) :
    queue.offer(a);

const droppingOffer = (n: number) => <A>(queue: Dequeue<A>, a: A): Dequeue<A> =>
  queue.size() >= n ? queue : queue.offer(a);

export function unboundedQueue<A>(): IO<never, ConcurrentQueue<A>> {
  return makeRef()(initial<A>())
    .map((ref) => makeConcurrentQueueImpl(ref, makeDeferred<never, A>(), unboundedOffer, unit, identity));
}

const natCapacity = natNumber(new Error("Die: capacity must be a natural number"));

export function slidingQueue<A>(capacity: number): IO<never, ConcurrentQueue<A>> {
  return natCapacity(capacity)
    .applySecond(
      makeRef()(initial<A>())
        .map((ref) => makeConcurrentQueueImpl(ref, makeDeferred<never, A>(), slidingOffer(capacity), unit, identity))
    );
}

export function droppingQueue<A>(capacity: number): IO<never, ConcurrentQueue<A>> {
  return natCapacity(capacity)
    .applySecond(
      makeRef()(initial<A>())
        .map((ref) => makeConcurrentQueueImpl(ref, makeDeferred<never, A>(), droppingOffer(capacity), unit, identity))
    );
}

export function boundedQueue<A>(capacity: number): IO<never, ConcurrentQueue<A>> {
  return natCapacity(capacity)
    .applySecond(
      makeRef()(initial<A>()).zip(makeSemaphore(capacity))
        .map(([ref, sem]) =>
          makeConcurrentQueueImpl(ref, makeDeferred<never, A>(), unboundedOffer, sem.acquire, (inner) =>
            // Before take, we must release the semaphore. If we are interrupted we should re-acquire the item
            sem.release.bracketExit((_, exit) => exit._tag === "interrupted" ? sem.acquire : unit, (_) => inner)
          )
        )
    );
}

function makeConcurrentQueueImpl<A>(state: Ref<State<A>>,
                                    factory: IO<never, Deferred<never, A>>,
                                    overflowStrategy: FunctionN<[Dequeue<A>, A], Dequeue<A>>,
  // This is effect that precedes offering
  // in the case of a boudned queue it is responsible for acquiring the semaphore
                                    offerGate: IO<never, void>,
  // This is the function that wraps the constructed take IO action
  // In the case of a bounded queue, it is responsible for releasing the
  // semaphore and re-acquiring it on interrupt
                                    takeGate: FunctionN<[IO<never, A>], IO<never, A>>): ConcurrentQueue<A> {
  function cleanupLatch(latch: Deferred<never, A>): IO<never, void> {
    return state.update((current) =>
      pipe(
        current,
        fold(
          (waiting) => left(waiting.filter((item) => item !== latch)),
          (available) => right(available) as State<A>
        )
      )
    ).unit();
  }

  const take = takeGate(factory.chain((latch) =>
    state.modify((current) =>
      pipe(
        current,
        fold(
          (waiting) => [
            makeTicket(latch.wait, cleanupLatch(latch)),
            left(waiting.offer(latch)) as State<A>
          ] as const,
          (ready) =>
            pipe(
              ready.take(),
              poption.map(([next, q]) =>
                [makeTicket(succeed(next), unit), right(q) as State<A>] as const),
              getOrElse(() => [
                makeTicket(latch.wait, cleanupLatch(latch)),
                left(of(latch)) as State<A>
              ] as const)
            )
        )
      )
    ).bracketExit(ticketExit, ticketUse)
  ));

  const offer = (a: A): IO<never, void> => offerGate.applySecond(state.modify((current) =>
    pipe(
      current,
      fold(
        (waiting) =>
          pipe(
            waiting.take(),
            poption.map(([next, q]) => [next.done(a), left(q) as State<A>] as const),
            getOrElse(() => [unit, right(overflowStrategy(empty(), a)) as State<A>] as const)
          ),
        (available) => [unit, right(overflowStrategy(available, a)) as State<A>] as const
      )
    )
  ).flatten().uninterruptible());
  return {
    take,
    offer
  };
}
