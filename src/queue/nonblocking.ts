import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { Deferred } from "../deferred";
import { Dequeue } from "../internal/dequeue";
import { Ticket } from "../internal/ticket";
import { IO } from "../io";
import { Ref } from "../ref";
import { AsyncQueue, CloseableAsyncQueue } from "./iface";

import { CloseableQueueState, EnqueueStrategy, QueueState } from "./common";

export class AsyncQueueImpl<A> implements AsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, A>;

  constructor(private readonly state: Ref<QueueState<A>>, private readonly enqueue: EnqueueStrategy<A>) {

    const makeTicket = Deferred.alloc<A>()
      .chain((deferred) =>
        state.modify((current) =>
          current.fold<[Ticket<A>, QueueState<A>]>(
            (waiting) => [new Ticket(deferred.wait, this.unregister(deferred)), left(waiting.enqueue(deferred))],
            (available) => {
              const [next, queue] = available.dequeue();
              if (next) {
                return [new Ticket(IO.of(next), IO.void()), right(queue)];
              }
              return [new Ticket(deferred.wait, this.unregister(deferred)), left(Dequeue.of(deferred))];
            }
          )
        )
      );

    this.count = state.get.map(queueCount);
    this.take = makeTicket.bracketExit(Ticket.cleanup, Ticket.wait);
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

  private unregister(deferred: Deferred<A>): IO<never, void> {
    return this.state.update((current) =>
    current.fold(
      (waiting) => left(Dequeue.ofAll(waiting.array.filter((d) => d !== deferred))),
      (available) => right(available))
    ).void();
  }
}

export class CloseableAsyncQueueImpl<A> implements CloseableAsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, Option<A>>;
  public readonly close: IO<never, void>;
  public readonly isClosed: IO<never, boolean>;

  constructor(private readonly state: Ref<CloseableQueueState<A>>,
              private readonly closed: Deferred<Option<A>>,
              private readonly enqueue: EnqueueStrategy<Option<A>>) {

    const makeTicket = Deferred.alloc<Option<A>>()
      .chain((deferred) =>
        state.modify((current) => {
            // If we are closed we should just produdce a none immediately
          if (current.closed) {
            return current.queue.fold<[Ticket<Option<A>>, CloseableQueueState<A>]>(
              (waiting) => [new Ticket(IO.of(none), IO.void()), {...current, queue: left(waiting)}],
              (available) => {
                // See if we have available things to drain from the queue
                const [next, queue] = available.dequeue();
                if (next) {
                    return [
                      new Ticket(IO.of(next), IO.void()),
                      {...current, queue: right(queue) }
                    ];
                  }
                return [
                  new Ticket(IO.of(none), IO.void()),
                  {...current, queue: left(Dequeue.empty()) }
                ];
              }
            );
            } else {
              const cleanup = this.unregister(deferred);
              return current.queue.fold<[Ticket<Option<A>>, CloseableQueueState<A>]>(
                (waiting) => [
                  new Ticket(
                    deferred.wait.race(this.closed.wait)
                      // Always remove the from the queue even if close occurs
                      .ensuring(cleanup),
                    cleanup
                    ),
                  {...current, queue: left(waiting.enqueue(deferred))}
                ],
                (available) => {
                  const [next, queue] = available.dequeue();
                  if (next) {
                    return [
                      new Ticket(IO.of(next), IO.void()),
                      {...current, queue: right(queue) }
                    ];
                  }
                  return [
                    new Ticket(
                      deferred.wait.race(closed.wait)
                        .ensuring(cleanup),
                      cleanup
                    ),
                    {...current, queue: left(Dequeue.of(deferred)) }
                  ];
                }
              );
            }
          }
        )
      );

    this.count = state.get.map((c) => c.queue).map(queueCount);
    this.take = makeTicket.bracketExit(Ticket.cleanup, Ticket.wait);
    this.close = state.modify((current) =>
      current.closed ? [IO.void(), current] : [closed.fill(none), {...current, closed: true}]
    ).flatten().critical();
    this.isClosed = state.get.map((c) => c.closed);
  }

  public offer(a: A): IO<never, boolean> {
    return this.state.modify((current) => {
      if (current.closed) {
        return [IO.of(false), current];
      }
      return current.queue.fold<[IO<never, boolean>, CloseableQueueState<A>]>(
        (waiting) => {
          const [next, queue] = waiting.dequeue();
          if (next) {
            return [next.fill(some(a)).as(true), {...current, queue: left(queue)}];
          }
          return [IO.of(true), {closed: false, queue: right(Dequeue.of(some(a)))}];
        },
        (available) => [IO.of(true), {closed: false, queue: right(this.enqueue(some(a), available))}]
      );
    }).flatten().critical();
  }

  private unregister(deferred: Deferred<Option<A>>): IO<never, void> {
    return this.state.update((current) => {
      return {
        ...current,
        queue: current.queue.fold(
          (waiting) => left(Dequeue.ofAll(waiting.array.filter((d) => d !== deferred))),
          (available) => right(available)
        )
      };
    }).void();
  }
}

function queueCount(state: Either<Dequeue<unknown>, Dequeue<unknown>>): number {
  return state.fold(
    (waiting) => waiting.empty ? 0 : -1 * waiting.length,
    (available) => available.length
  );
}
