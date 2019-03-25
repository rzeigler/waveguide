export * from "./iface";
import { right } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { Deferred } from "../deferred";
import { Dequeue } from "../internal/dequeue";
import { IO } from "../io";
import { Ref } from "../ref";
import { Semaphore } from "../semaphore";
import { AsyncQueueImpl as BQImpl } from "./blocking";
import { CloseableQueueState, droppingStrategy, QueueState, slidingStrategy, unboundedStrategy } from "./common";
import { AsyncQueue, CloseableAsyncQueue } from "./iface";
import {
  AsyncQueueImpl as QImpl,
  CloseableAsyncQueueImpl as CQImpl } from "./nonblocking";

export type OverflowStrategy = "slide" | "drop";

export function unboundedQueue<A>(): IO<never, AsyncQueue<A>> {
  return Ref.alloc<QueueState<A>>(right(Dequeue.empty()))
    .map((ref) => new QImpl(ref, unboundedStrategy));
}

export function boundedQueue<A>(strategy: OverflowStrategy, max: number): IO<never, AsyncQueue<A>> {
  return Ref.alloc<QueueState<A>>(right(Dequeue.empty()))
    .map((ref) => new QImpl(ref, strategy === "slide" ? slidingStrategy(max) : droppingStrategy(max)));
}

export function unboundedCloseableQueue<A>(): IO<never, CloseableAsyncQueue<A>> {
  return Ref.alloc<CloseableQueueState<A>>({closed: false, queue: right(Dequeue.empty())})
    .product(Deferred.alloc<Option<A>>())
    .map(([ref, def]) => new CQImpl(ref, def, unboundedStrategy));
}

export function boundedCloseableQueue<A>(strategy: OverflowStrategy, max: number): IO<never, CloseableAsyncQueue<A>> {
  return Ref.alloc<CloseableQueueState<A>>({closed: false, queue: right(Dequeue.empty())})
    .product(Deferred.alloc<Option<A>>())
    .map(([ref, def]) => new CQImpl(ref, def, strategy === "slide" ? slidingStrategy(max) : droppingStrategy(max)));
}

export function blockingQueue<A>(max: number): IO<never, AsyncQueue<A>> {
  return Ref.alloc<QueueState<A>>(right(Dequeue.empty())).product(Semaphore.alloc(max))
    .map(([ref, sem]) => new BQImpl(ref, sem));
}
