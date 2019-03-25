import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";

import { Deferred } from "../deferred";
import { Dequeue } from "../internal/dequeue";
import { Ticket } from "../internal/ticket";
import { IO } from "../io";
import { Ref } from "../ref";
import { Abort } from "../result";
import { Semaphore } from "../semaphore";
import { QueueState } from "./common";
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

function queueCount(state: Either<Dequeue<unknown>, Dequeue<unknown>>): number {
  return state.fold(
    (waiting) => waiting.empty ? 0 : -1 * waiting.length,
    (available) => available.length
  );
}
