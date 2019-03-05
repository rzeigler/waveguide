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
import { Dequeue } from "./internal/queue";
import { IO } from "./io";
import { Ref } from "./ref";
import { Abort, FiberResult, First, OneOf, Second } from "./result";

export interface AsyncQueue<A> {
  readonly count: IO<never, number>;
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

type State<A> = OneOf<Dequeue<Deferred<A>>, Dequeue<A>>;

class AsyncQueueImpl<A> implements AsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, A>;
  constructor(private readonly state: Ref<State<A>>) {
    this.count = state.get.map(queueCount);
    this.take = makeTicket(this, state).bracketExit(cleanupTicket, (ticket) => ticket.take);
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
      return [IO.void(), new Second(current.second.enqueue(a))];
    }).flatten();
  }
}

export function unboundedQueue<A>(): IO<never, AsyncQueue<A>> {
  return Ref.alloc<State<A>>(new Second(Dequeue.empty()))
    .map((ref) => new AsyncQueueImpl(ref));
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

class Ticket<A> {
  constructor(public readonly take: IO<never, A>, public readonly unregister: IO<never, void>) { }
}

function cleanupTicket<A>(ticket: Ticket<A>, exit: FiberResult<never, A>): IO<never, void> {
  if (exit._tag === "interrupted") {
    return ticket.unregister;
  }
  return IO.void();
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
