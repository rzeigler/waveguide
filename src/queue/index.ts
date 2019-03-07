// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { right } from "fp-ts/lib/Either";
import { assert, isGt } from "../internal/assert";
import { Dequeue } from "../internal/queue";
import { IO } from "../io";
import { Ref } from "../ref";
import { AsyncQueue } from "./common";
import {
  droppingStrategy,
  FiniteNonBlockingQueue,
  NonBlockingQueue,
  slidingStrategy,
  State as NonBlockingState,
  unboundedStrategy } from "./nonblocking";

export { AsyncQueue } from "./common";

export type OverflowStrategy = "slide" | "drop";

export function unboundedNonBlockingQueue<A>(): IO<never, AsyncQueue<A>> {
  return Ref.alloc<NonBlockingState<A>>(right(Dequeue.empty()))
    .map((state) => new NonBlockingQueue(state, unboundedStrategy));
}

export function boundedNonBlockingQueue<A>(max: number, strategy: OverflowStrategy): IO<never, AsyncQueue<A>> {
  return assert(max, isGt(0), "Bug: Max queue size must be > 0")
    .applySecond(Ref.alloc<NonBlockingState<A>>(right(Dequeue.empty())))
    .map((state) => new NonBlockingQueue(state,  strategy === "slide" ? slidingStrategy(max) : droppingStrategy(max)));
}
