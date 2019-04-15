import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";

import { Deferred } from "../deferred";
import { Dequeue } from "../internal/dequeue";
import { Ticket } from "../internal/ticket";
import { IO } from "../io";
import { Ref } from "../ref";
import { Abort } from "../result";
import { Semaphore } from "../semaphore";
import { CloseableQueueState, QueueState } from "./common";
import { AsyncQueue } from "./iface";

export class AsyncQueueImpl<A> implements AsyncQueue<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, A>;

  constructor(private readonly state: Ref<QueueState<A>>, private readonly semaphore: Semaphore) {
    const makeTicket = Deferred.alloc<A>()
      .chain((deferred) =>
        // Everytime we queue up a read, that means we are freeing up max capacity, ergo, semaphore release
        // On ticket cleanup (for interruption) we perform the opposite action of acquiring to ensure we
        // don't accidentally increase max capacity
        this.semaphore.release.applySecond(
          state.modify((current) =>
            current.fold<[Ticket<A>, QueueState<A>]>(
              (waiting) => [
                new Ticket(
                  deferred.wait,
                  this.unregister(deferred)
                ),
                left(waiting.enqueue(deferred))],
              (available) => {
                const [next, queue] = available.dequeue();
                if (next) {
                  return [new Ticket(IO.of(next), IO.void()), right(queue)];
                }
                return [new Ticket(deferred.wait, this.unregister(deferred)), left(Dequeue.of(deferred))];
              }
            )
          )
        )
      );

    this.count = this.state.get.map(queueCount);
    this.take = makeTicket.bracketExit(Ticket.cleanup, Ticket.wait);
  }

  public offer(a: A): IO<never, void> {
    // TODO: This is almost identical to the non-blocking version...
    return this.semaphore.acquire
      .applySecond(this.state
        .modify((current) =>
          current.fold<[IO<never, void>, QueueState<A>]>(
            (waiting) => {
              const [next, queue] = waiting.dequeue();
              if (next) {
                return [next.fill(a), left(queue)];
              }
              return [IO.void(), right(Dequeue.of(a))];
            },
            (available) => [IO.void(), right(available.enqueue(a))]
          )
        ).flatten());
  }

  private unregister(deferred: Deferred<A>) {
    return this.state.modify((current) =>
      current.fold<[IO<never, void>, QueueState<A>]>(
        (waiting) => {
          const contains = waiting.array.find((d) => d === deferred);
          // If we still have the deferred in the state, then we need should acquire
          return [
            contains ? this.semaphore.acquire : IO.void(),
            left(Dequeue.ofAll(waiting.array.filter((d) => d !== deferred)))
          ];
        },
        // Already delivered somehow, so we don't want to attempt to acquire
        (available) => [IO.void(), right(available)]
      )
    ).flatten();
  }
}

export class CloseableAsyncQueueImpl<A> {
  public readonly count: IO<never, number>;
  public readonly take: IO<never, Option<A>>;
  public readonly close: IO<never, void>;
  public readonly isClosed: IO<never, boolean>;

  constructor(private readonly state: Ref<CloseableQueueState<A>>,
              private readonly closed: Deferred<Option<A>>,
              private readonly semaphore: Semaphore) {
    // Everytime we queue up a read, that means we are freeing up max capacity, ergo, semaphore release
    // On ticket cleanup (for interruption) we perform the opposite action of acquiring to ensure we
    // don't accidentally increase max capacity
    // If our read completes early because of close, its safe to just ignore the release because leaking max
    // capacity in a closed state doesn't matter
    const makeTicket = Deferred.alloc<Option<A>>()
      .chain((deferred) =>
        this.semaphore.release.applySecond(
          this.state.modify((current) => {
            // The queue is closed, so we need to ensure we are draining
            if (current.closed) {
              return current.queue.fold<[Ticket<Option<A>>, CloseableQueueState<A>]>(
                // we are queued up on waits, so we can do nothing
                (waiting) => [new Ticket(IO.of(none), IO.void()), {...current, queue: left(waiting)}],
                (available) => {
                  const [next, queue] = available.dequeue();
                  // there is an available element so we should drain it
                  if (next) {
                    return [
                      new Ticket(IO.of(next), IO.void()),
                      {...current, queue: right(queue)}
                    ];
                  }
                  // otherwise there is nothing we can do
                  return [
                    new Ticket(IO.of(none), IO.void()),
                    {...current, queue: left(Dequeue.empty())}
                  ];
                }
              );
            } else {
              // The queue is not closed
              // We want to construct tickets that wait on the constructed deferred and the closed implementation
              // The tickets should also always remove the deferred from the queue
              const cleanup = this.unregister(deferred);
              return current.queue.fold<[Ticket<Option<A>>, CloseableQueueState<A>]>(
                (waiting) => [
                  new Ticket(
                    deferred.wait.race(this.closed.wait)
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
                      {...current, queue: right(queue)}
                    ];
                  }
                  return [
                    new Ticket(
                      deferred.wait.race(this.closed.wait)
                        .ensuring(cleanup),
                      cleanup
                    ),
                    {...current, queue: left(Dequeue.of(deferred))}
                  ];
                }
              );
            }
          })
        )
      );

    this.count = this.state.get.map((s) => queueCount(s.queue));
    this.take = makeTicket.bracketExit(Ticket.cleanup, Ticket.wait);
    this.close = state.modify((current) =>
      current.closed ? [IO.void(), current] : [closed.fill(none), {...current, closed: true}]
    ).flatten().critical();
    this.isClosed = state.get.map((c) => c.closed);
  }

  public offer(a: A): IO<never, boolean> {
    const offerIO = this.state.modify((current) => {
      // Don't worry about closed check due to acquisition logic
      return current.queue.fold<[IO<never, void>, CloseableQueueState<A>]>(
        (waiting) => {
          const [next, queue] = waiting.dequeue();
          if (next) {
            return [next.fill(some(a)), {...current, queue: left(queue)}];
          }
          return [IO.void(), {...current, queue: right(Dequeue.of(some(a)))}];
        },
        (available) => [IO.void(), {...current, queue: right(available.enqueue(some(a)))}]
      );
    });

    return this.semaphore.acquire.as(true)
      .race(this.closed.wait.as(false))
      .branch(offerIO.as(true), IO.of(false));
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
