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
import { assert, isGt } from "./internal/assert";
import { Dequeue } from "./internal/queue";
import { Ticket } from "./internal/ticket";
import { IO } from "./io";
import { Ref } from "./ref";
import { Abort, FiberResult, First, OneOf, Second } from "./result";

export interface AsyncQueue<A> {
  readonly count: IO<never, number>;
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

type State<A> = OneOf<Dequeue<Deferred<A>>, Dequeue<A>>;

type EnqueueStrategy<A> = (a: A, current: Second<Dequeue<A>>) => Second<Dequeue<A>>;

const unboundedStrategy =
  <A>(a: A, current: Second<Dequeue<A>>): Second<Dequeue<A>> => new Second(current.second.enqueue(a));

const droppingStrategy = (max: number) => <A>(a: A, current: Second<Dequeue<A>>): Second<Dequeue<A>> =>
  current.second.length >= max ? current : new Second(current.second.enqueue(a));

const slidingStrategy = (max: number) => <A>(a: A, current: Second<Dequeue<A>>): Second<Dequeue<A>> => {
  if (current.second.length >= max) {
    const [_, queue] = current.second.dequeue();
    return new Second(queue.enqueue(a));
  }
  return new Second(current.second.enqueue(a));
};

class AsyncQueueImpl<A> implements AsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, A>;
  constructor(private readonly state: Ref<State<A>>, private readonly enqueue: EnqueueStrategy<A>) {
    this.count = state.get.map(queueCount);
    this.take = makeTicket(this, state).bracketExit(Ticket.cleanup, (ticket) => ticket.wait);
  }

  public offer(a: A): IO<never, void> {
    return this.state.modify((current) => {
      if (current._tag === "first") {
        const [next, queue] = current.first.dequeue();
        if (next) {
          return [next.fill(a), new First(queue)];
        }
        return [IO.void(), new Second(Dequeue.of(a))];
      }
      return [IO.void(), this.enqueue(a, current)];
    }).flatten();
  }
}

export function unsafeUnboundedQueue<A>(): AsyncQueue<A> {
  return new AsyncQueueImpl(Ref.unsafeAlloc<State<A>>(new Second(Dequeue.empty())), unboundedStrategy);
}

/**
 * Create IO for a Queue<A> with unbounded length.
 */
export function unboundedQueue<A>(): IO<never, AsyncQueue<A>> {
  return Ref.alloc<State<A>>(new Second(Dequeue.empty()))
    .map((ref) => new AsyncQueueImpl(ref, unboundedStrategy));
}

export type OverflowStrategy = "slide" | "drop";

/**
 * Create an IO for a Queue<A> with bounded length.
 *
 * The available strategies are:
 *
 * "slide" - the oldest item in the queue should be discarded
 * "drop" - the offerred item should be discarded (not added)
 *
 * Regardless of strategy the offer IO will always produce void immediately.
 * For a queue that semantically blocks the oferring fiber until space is available see {@link blockingQueue<A>()};
 *
 * @param strategy strategy for what to do when an offer would go over the maximum
 * @param max maximum size of this queue
 */
export function boundedQueue<A>(strategy: OverflowStrategy, max: number): IO<never, AsyncQueue<A>> {
  return assert(max, isGt(0), "Bug: Max queue size must be > 0")
    .applySecond(Ref.alloc<State<A>>(new Second(Dequeue.empty()))
      .map((ref) => new AsyncQueueImpl(ref, strategy === "slide" ? slidingStrategy(max) : droppingStrategy(max))));
}

export function blockingQueue<A>(max: number): IO<never, AsyncQueue<A>> {
  return IO.aborted(new Abort("not yet implemented"));
}

function queueCount<A>(state: State<A>): number {
  if (state._tag === "first") {
    if (state.first.empty) {
      return 0;
    }
    return -1 * state.first.length;
  }
  return state.second.length;
}

function makeTicket<A>(queue: AsyncQueue<A>, state: Ref<State<A>>): IO<never, Ticket<A>> {
  function unregister(deferred: Deferred<A>): IO<never, void> {
    return state.update((current) => {
      if (current._tag === "first") {
        return new First(Dequeue.ofAll(current.first.array.filter((d) => d !== deferred)));
      }
      return current;
    }).void();
  }

  /**
   * Return an item to the queue
   * @param item
   */
  function push(item: A): IO<never, void> {
    return queue.offer(item);
  }

  return Deferred.alloc<A>().chain((deferred) =>
    state.modify((current) => {
      if (current._tag === "first") {
        return [new Ticket(deferred.wait, unregister(deferred)), new First(current.first.enqueue(deferred))];
      }
      const [next, q] = current.second.dequeue();
      if (next) {
        return [new Ticket(IO.of(next), push(next)), new Second(q)];
      }
      return [new Ticket(deferred.wait, unregister(deferred)), new First(Dequeue.of(deferred))];
    })
  );
}
