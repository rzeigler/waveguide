// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { array } from "fp-ts/lib/Array";
import { none, Option, some } from "fp-ts/lib/Option";
import { log } from "../console";
import { blockingQueue, boundedQueue, unboundedCloseableQueue, unboundedQueue } from "../queue";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv } from "./lib.spec";

const append = <A>(a: A) => (as: A[]) => [...as, a];

describe("Unbounded Async Queue", () => {
  it("should allow consuming elements in the order they were added", () => {
    const io = unboundedQueue<number>().product(Ref.alloc<number[]>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return queue.offer(1)
          .applySecond(queue.offer(2))
          .applySecond(queue.offer(3))
          .applySecond(read)
          .applySecond(read)
          .applySecond(read)
          .applySecond(ref.get);
      });
    return equiv(io, new Value([1, 2, 3]));
  });
  it("should block consumers until there is a value ready", () => {
    const io = unboundedQueue<number>().product(Ref.alloc<number[]>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return read.fork().chain((fib1) =>
          read.fork().chain((fib2) =>
            ref.get.delay(50).chain((order1) =>
              queue.offer(1).applySecond(queue.offer(2))
              .applySecond(fib1.wait).applySecond(fib2.wait)
              .applySecond(ref.get)
              .map((order2) => [order1, order2]))));
      });
    return equiv(io, new Value([[], [1, 2]]));
  });
  it("should allow consumers to stack up", () => {
    const io = unboundedQueue<number>().product(Ref.alloc<number[]>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return queue.offer(1)
        .applySecond(
          read.fork().product(read.fork()).chain(([fib1, fib2]) =>
            fib1.wait.applySecond(ref.get)
              .chain((order1) => queue.offer(2)
                .applySecond(fib2.wait)
                .applySecond(ref.get.map((order2) => [order1, order2])))
          )
        );
      });
    return equiv(io, new Value([[1], [1, 2]]));
  });
  it("should ensure available items are removed before subsequent reads", () => {
    const io = unboundedQueue<number>().product(Ref.alloc<number[]>([]))
      .chain(([queue, ref]) => {
        const read = queue.take;
        return queue.offer(1)
            .applySecond(read.timeout(20).product(read.timeout(20)));
      });
    return equiv(io, new Value([some(1), none]));
  });
  it("should allow reads to be cancelled", () => {
    const io = unboundedQueue<number>().product(Ref.alloc<Array<[string, number]>>([]))
      .chain(([queue, ref]) => {
        const read = (name: string) => queue.take.chain((n) => ref.update(append([name, n] as [string, number])));
        return read("a").fork().product(read("b").fork())
        .chain(([fiba, fibb]) =>
          fiba.interruptAndWait.applySecond(queue.offer(1)).applySecond(fibb.wait).applySecond(ref.get)
        );
      });
    return equiv(io, new Value([["b", 1]]));
  });
});

describe("Bounded Non Blocking Queue", () => {
  it("should be bounded", () => {
    const io = boundedQueue<number>("slide", 1).product(Ref.alloc<number[]>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return queue.offer(1)
        .applySecond(queue.offer(2))
        .applySecond(queue.offer(3))
        .applySecond(read)
        .applySecond(ref.get);
      });
    return equiv(io, new Value([3]));
  });
});

describe("Closeable Queue", () => {
  it("should allow consuming elements in the order they were added", () => {
    const io = unboundedCloseableQueue<number>().product(Ref.alloc<Array<Option<number>>>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return queue.offer(1)
          .applySecond(queue.offer(2))
          .applySecond(queue.offer(3))
          .applySecond(read)
          .applySecond(read)
          .applySecond(read)
          .applySecond(ref.get);
      });
    return equiv(io, new Value([some(1), some(2), some(3)]));
  });
  it("should allow draining a closed queue", () => {
    const io = unboundedCloseableQueue<number>().product(Ref.alloc<Array<Option<number>>>([]))
      .chain(([queue, ref]) => {
        const read = queue.take.chain((n) => ref.update(append(n)));
        return queue.offer(1)
          .applySecond(queue.close)
          .applySecond(read)
          .applySecond(read)
          .applySecond(ref.get);
      });
    return equiv(io, new Value([some(1), none]));
  });
  it("should allo wreturning none for blocked waiters", () => {
    const io = unboundedCloseableQueue<number>().product(Ref.alloc<Array<Option<number>>>([]))
    .chain(([queue, ref]) => {
      const read = queue.take.chain((n) => ref.update(append(n)));
      return read.fork().applySecond(read.fork()).applySecond(read.fork())
        .chain((fib) =>
          queue.offer(1)
            .applySecond(queue.close)
            .applySecond(fib.wait)
            .applySecond(ref.get)
        );
    });
    return equiv(io, new Value([some(1), none, none]));
  });
});

import { monad } from "../instances";

describe("Blocking Queue", () => {
  it("should block while waiting for values", () => {
    const io = blockingQueue<number>(1).product(Ref.alloc<number[]>([]))
    .chain(([queue, wrote]) => {
      const write = (n: number) => queue.offer(n).applySecond(wrote.update(append(n)));
      // Array evaluates effects from right to left?
      // const bulkWrite = array.traverse(monad)([1, 2, 3], write).void();
      const bulkWrite = write(1).applySecond(write(2)).applySecond(write(3)).void();
      const bulkRead = queue.take.forever();
      return bulkWrite.fork()
        .chain((fiber) =>
          wrote.get.delay(50).applyFirst(bulkRead.fork()).product(fiber.wait.applySecond(wrote.get))
        );
    });
    return equiv(io, new Value([[1], [1, 2, 3]]));
  });
});
