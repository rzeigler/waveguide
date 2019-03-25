import { Either } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { Deferred } from "../deferred";
import { Dequeue } from "../internal/dequeue";

export type EnqueueStrategy<A> = (a: A, current: Dequeue<A>) => Dequeue<A>;

export type Available<A> = Dequeue<A>;
export type Waiting<A> = Dequeue<Deferred<A>>;
export type QueueState<A> = Either<Waiting<A>, Available<A>>;

export interface CloseableQueueState<A> {
  closed: boolean;
  queue: QueueState<Option<A>>;
}

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
