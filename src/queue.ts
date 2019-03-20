// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option } from "fp-ts/lib/Option";
import { Deferred } from "./deferred";
import { assert, isGt } from "./internal/assert";
import { Dequeue } from "./internal/dequeue";
import { Ticket } from "./internal/ticket";
import { IO } from "./io";
import { Ref } from "./ref";
import { Abort } from "./result";

export interface AsyncQueue<A> {
  readonly count: IO<never, number>;
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

export interface CloseableAsyncQueue<A> {
  readonly close: IO<never, void>;
  readonly isClosed: IO<never, boolean>;
  readonly count: IO<never, number>;
  readonly take: IO<never, Option<A>>;
  offer(a: A): IO<never, boolean>;
}

export type OverflowStrategy = "slide" | "drop";

export function unboundedQueue<A>(): IO<never, AsyncQueue<A>> {
  return Ref.alloc<QueueState<A>>(right(Dequeue.empty()))
    .map((state) => new Queue(state, unboundedStrategy));
}

export function boundedQueue<A>(max: number, strategy: OverflowStrategy): IO<never, AsyncQueue<A>> {
  return assert(max, isGt(0), "Bug: Max queue size must be > 0")
    .applySecond(Ref.alloc<QueueState<A>>(right(Dequeue.empty())))
    .map((state) => new Queue(state,  strategy === "slide" ? slidingStrategy(max) : droppingStrategy(max)));
}

export type EnqueueStrategy<A> = (a: A, current: Dequeue<A>) => Dequeue<A>;

export type Available<A> = Dequeue<A>;
export type Waiting<A> = Dequeue<Deferred<A>>;
export type QueueState<A> = Either<Waiting<A>, Available<A>>;

export const unboundedStrategy =
  <A>(a: A, current: Dequeue<A>): Dequeue<A> => current.enqueue(a);

export const droppingStrategy = (max: number) => <A>(a: A, current: Dequeue<A>): Dequeue<A> =>
  current.length >= max ? current : current.enqueue(a);

export const slidingStrategy = (max: number) => <A>(a: A, current: Dequeue<A>): Dequeue<A> => {
  if (current.length >= max) {
    const queue = current.dequeue()[1];
    return queue.enqueue(a);
  }
  return current.enqueue(a);
};

export class Queue<A> implements AsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, A>;

  constructor(private readonly state: Ref<QueueState<A>>, private readonly enqueue: EnqueueStrategy<A>) {
    function unregister(deferred: Deferred<A>): IO<never, void> {
      return state.update((current) =>
        current.fold(
          (waiting) => left(Dequeue.ofAll(waiting.array.filter((d) => d !== deferred))),
          (available) => right(available))
        ).void();
    }

    const makeTicket = Deferred.alloc<A>()
      .chain((deferred) =>
        state.modify((current) =>
          current.fold<[Ticket<A>, QueueState<A>]>(
            (waiting) => [new Ticket(deferred.wait, unregister(deferred)), left(waiting.enqueue(deferred))],
            (available) => {
              const [next, queue] = available.dequeue();
              if (next) {
                return [new Ticket(IO.of(next), IO.void()), right(queue)];
              }
              return [new Ticket(deferred.wait, unregister(deferred)), left(Dequeue.of(deferred))];
            }
          )
        )
      );
    this.count = state.get.map(queueCount);
    this.take = makeTicket.bracketExit(Ticket.cleanup, (ticket) => ticket.wait);
  }

  public offer(a: A): IO<never, void> {
    return this.state
      .modify((current) =>
        current.fold<[IO<never, void>, QueueState<A>]>(
          (waiting) => {
            const [next, queue] = waiting.dequeue();
            if (next) {
              return [next.fill(a), left(queue)];
            }
            return [IO.void(), right(Dequeue.of(a))];
          },
          (available) => [IO.void(), right(this.enqueue(a, available))]
        )
      ).flatten();
  }
}

export class CloseableQueue<A> implements CloseableAsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, Option<A>>;
  public readonly close: IO<never, void>;
  public readonly isClosed: IO<never, boolean>;

  constructor(private readonly state: Ref<QueueState<Option<A>>>,
              private readonly closed: Deferred<Option<A>>,
              private readonly enqueue: EnqueueStrategy<Option<A>>) {
    this.count = state.get.map(queueCount);
    this.take = IO.aborted(new Abort("boom!"));
    this.close = closed.isEmpty.ifM(closed.fill(none), IO.void());
    this.isClosed = closed.isFull;
  }

  public offer(a: A): IO<never, boolean> {
    return IO.aborted(new Abort("boom!"));
  }
}

function queueCount(state: Either<Dequeue<unknown>, Dequeue<unknown>>): number {
  return state.fold(
    (waiting) => waiting.empty ? 0 : -1 * waiting.length,
    (available) => available.length
  );
}
