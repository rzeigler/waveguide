import { unsafeUnboundedQueue } from "../asyncqueue";
import { IO } from "../io";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv } from "./lib.spec";

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

const append = <A>(a: A) => (as: A[]) => [...as, a];

describe("Unbounded Async Queue", () => {
  it("should allow consuming elements in the order they were added", () => {
    const ref = Ref.unsafeAlloc<number[]>([]);
    const queue = unsafeUnboundedQueue<number>();
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
    const queue = unsafeUnboundedQueue<number>();
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
    const queue = unsafeUnboundedQueue<number>();
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
    const queue = unsafeUnboundedQueue<number>();
    const read = queue.take;
    const io =
      queue.offer(1)
        .applySecond(read.timeout(20).product(read.timeout(20)));
    return equiv(io, new Value([1, undefined]));
  });
  it("should allow reads to be cancelled", () => {
    const ref = Ref.unsafeAlloc<Array<[string, number]>>([]);
    const queue = unsafeUnboundedQueue<number>();
    const read = (name: string) => queue.take.chain((n) => ref.update(append([name, n] as [string, number])));
    const io =
      read("a").fork().product(read("b").fork())
        .chain(([fiba, fibb]) =>
          fiba.interruptAndWait.applySecond(queue.offer(1)).applySecond(fibb.wait).applySecond(ref.get)
        );
    return equiv(io, new Value([["b", 1]]));
  });
  it("should be unbounded", () => {
    const queue = unsafeUnboundedQueue<number>();
    const inserts: Array<IO<never, void>> = [];
    for (let i = 0; i < 10000; i++) {
      inserts.push(queue.offer(i));
    }
    const insert = inserts.reduce((l, r) => l.applySecond(r));
    const io = insert.applySecond(queue.count);
    return equiv(io, new Value(10000));
  });
});
