// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { right } from "fp-ts/lib/Either";
import { none, some } from "fp-ts/lib/Option";
import { Dequeue } from "../internal/dequeue";
import { IO } from "../io";
import { NonBlockingQueue, NonBlockingState, slidingStrategy, unboundedStrategy } from "../queue";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv } from "./lib.spec";

const append = <A>(a: A) => (as: A[]) => [...as, a];

describe("Unbounded Async Queue", () => {
  it("should allow consuming elements in the order they were added", () => {
    const ref = Ref.unsafeAlloc<number[]>([]);
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const read = queue.take.chain((n) => ref.update(append(n)));
    const io = queue.offer(1)
      .applySecond(queue.offer(2))
      .applySecond(queue.offer(3))
      .applySecond(read)
      .applySecond(read)
      .applySecond(read)
      .applySecond(ref.get);
    return equiv(io, new Value([1, 2, 3]));
  });
  it("should block consumers until there is a value ready", () => {
    const ref = Ref.unsafeAlloc<number[]>([]);
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const read = queue.take.chain((n) => ref.update(append(n)));
    const io =
      read.fork().chain((fib1) =>
        read.fork().chain((fib2) =>
          ref.get.delay(50).chain((order1) =>
            queue.offer(1).applySecond(queue.offer(2))
            .applySecond(fib1.wait).applySecond(fib2.wait)
            .applySecond(ref.get)
            .map((order2) => [order1, order2]))));
    return equiv(io, new Value([[], [1, 2]]));
  });
  it("should allow consumers to stack up", () => {
    const ref = Ref.unsafeAlloc<number[]>([]);
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const read = queue.take.chain((n) => ref.update(append(n)));
    const io =
      queue.offer(1)
        .applySecond(
          read.fork().product(read.fork()).chain(([fib1, fib2]) =>
            fib1.wait.applySecond(ref.get)
              .chain((order1) => queue.offer(2)
                .applySecond(fib2.wait)
                .applySecond(ref.get.map((order2) => [order1, order2])))
          )
        );
    return equiv(io, new Value([[1], [1, 2]]));
  });
  it("should ensure available items are removed before subsequent reads", () => {
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const read = queue.take;
    const io =
      queue.offer(1)
        .applySecond(read.timeout(20).product(read.timeout(20)));
    return equiv(io, new Value([some(1), none]));
  });
  it("should allow reads to be cancelled", () => {
    const ref = Ref.unsafeAlloc<Array<[string, number]>>([]);
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const read = (name: string) => queue.take.chain((n) => ref.update(append([name, n] as [string, number])));
    const io =
      read("a").fork().product(read("b").fork())
        .chain(([fiba, fibb]) =>
          fiba.interruptAndWait.applySecond(queue.offer(1)).applySecond(fibb.wait).applySecond(ref.get)
        );
    return equiv(io, new Value([["b", 1]]));
  });
  it("should be unbounded", () => {
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, unboundedStrategy);
    const inserts: Array<IO<never, void>> = [];
    for (let i = 0; i < 10000; i++) {
      inserts.push(queue.offer(i));
    }
    const insert = inserts.reduce((l, r) => l.applySecond(r));
    const io = insert.applySecond(queue.count);
    return equiv(io, new Value(10000));
  });
});

describe("Bounded Non Blocking Queue", () => {
  it("should be bounded", () => {
    const ref = Ref.unsafeAlloc<number[]>([]);
    const state = Ref.unsafeAlloc<NonBlockingState<number>>(right(Dequeue.empty()));
    const queue = new NonBlockingQueue(state, slidingStrategy(1));
    const read = queue.take.chain((n) => ref.update(append(n)));
    const io = queue.offer(1)
      .applySecond(queue.offer(2))
      .applySecond(queue.offer(3))
      .applySecond(read)
      .applySecond(ref.get);
    return equiv(io, new Value([3]));
  });
});
