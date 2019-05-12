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

import { IO, abort, unit } from "./io";
import { Either, right, left } from "fp-ts/lib/Either";
import { Dequeue, empty } from "./support/dequeue";
import { Deferred, makeDeferred } from "./deferred";
import { makeRef, Ref } from "./ref";
import { Function2 } from "fp-ts/lib/function";
import { Ticket } from "./ticket";

export interface ConcurrentQueue<A> {
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

type State<A> = Either<Dequeue<Deferred<void, A>>, Dequeue<A>>;
const initial = <A>(): State<A> => right(empty());

class ConcurrentQueueImpl<A> implements ConcurrentQueue<A> {
  public readonly take: IO<never, A>;
  constructor(public readonly state: Ref<State<A>>, 
              public readonly factory: IO<never, Deferred<void, A>>,
              public readonly overflowStrategy: Function2<Dequeue<A>, A, Dequeue<A>>) {
      this.take = factory.chain((latch) =>
        this.state.modify((current) =>
          current.fold(
            (waiting) => [abort("boom"), left(waiting) as State<A>] as const,
            (ready) => [abort("boom"), right(ready) as State<A>] as const
          )
        ).flatten()
      );
  }
  public offer(a: A): IO<never, void> {
    return abort("boom");
  }
}

function sanityCheck(capacity: number): IO<never, void> {
  if (capacity < 0) {
    return abort(new Error("Die: queue capacity must be >= 0"));
  }
  return unit;
}

const unboundedOffer = <A>(queue: Dequeue<A>, a: A): Dequeue<A> => queue.offer(a);

const slidingOffer = (n: number) => <A>(queue: Dequeue<A>, a: A): Dequeue<A> =>
  queue.size() >= n ? queue.take().map((t) => t[1]).getOrElse(queue).offer(a) : queue.offer(a);

const droppingOffer = (n: number) => <A>(queue: Dequeue<A>, a: A): Dequeue<A> =>
  queue.size() >= n ? queue : queue.offer(a);

export function unboundedQueue<A>(): IO<never, ConcurrentQueue<A>> {
  return makeRef(initial<A>())
    .map((ref) => new ConcurrentQueueImpl(ref, makeDeferred<never, A>(), unboundedOffer));
}

export function slidingQueue<A>(capacity: number): IO<never, ConcurrentQueue<A>> {
  return sanityCheck(capacity)
    .applySecond(
      makeRef(initial<A>())
        .map((ref) => new ConcurrentQueueImpl(ref, makeDeferred<never, A>(), slidingOffer(capacity)))
    );
}

export function droppingQueue<A>(capacity: number): IO<never, ConcurrentQueue<A>> {
  return sanityCheck(capacity)
    .applySecond(
      makeRef(initial<A>())
        .map((ref) => new ConcurrentQueueImpl(ref, makeDeferred<never, A>(), droppingOffer(capacity)))
    );
}
