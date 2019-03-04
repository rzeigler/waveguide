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

import { expect } from "chai";
import { IO } from "../io";
import { Ref } from "../ref";
import { Value } from "../result";
import { Semaphore } from "../semaphore";
import { terminal } from "../terminal";
import { equiv } from "./lib.spec";

describe("Semaphore", () => {
  it("should allow observable acquisition", () => {
    const sem = Semaphore.unsafeAlloc(4);
    const fiberIO = sem.acquireN(3).yield_();
    const io = fiberIO.fork()
      .applySecond(IO.delay(10))
      .applySecond(sem.count);
    return equiv(io, new Value(1));
  });
  it("should allow observable releases", () => () => {
    const sem = Semaphore.unsafeAlloc(4);
    const fiberIO = sem.releaseN(3).yield_();
    const io = fiberIO.fork()
      .applySecond(IO.delay(10))
      .applySecond(sem.count);
    return equiv(io, new Value(7));
  });
  it("should allow observable blocking releases", () => {
    const advanced = Ref.unsafeAlloc(false);
    const sem = Semaphore.unsafeAlloc(0);
    const fiberIO = sem.withPermit(advanced.set(true)).yield_();
    const io = fiberIO.fork()
      .chain((fib) => advanced.get.delay(10)
        .product(sem.release.applySecond(fib.wait).applySecond(advanced.get)));
    return equiv(io, new Value([false, true] as [boolean, boolean]));
  });
  it("should allow for acquire to be interruptible", () => {
    const sem = Semaphore.unsafeAlloc(1);
    const moved = Ref.unsafeAlloc(false);
    const fiberIO = sem.acquireN(2).applySecond(moved.set(true));
    const io = fiberIO.fork()
      .chain((fib) => moved.get.delay(10)
        .product(fib.interruptAndWait.applySecond(moved.get).product(sem.count)));
    return  equiv(io, new Value([false, [false, 1]]));
  });
  it("interrupts should release acquired permits for subsequent acquires to advance", () => {
    const sem = Semaphore.unsafeAlloc(1);
    const moved = Ref.unsafeAlloc(0);
    const fiber1 = sem.acquireN(3).applySecond(moved.set(1));
    const fiber2 = sem.acquireN(1).applySecond(moved.set(2));
    const io = fiber1.fork()
      .chain((fib1) => fiber2.fork()
        .chain((fib2) => moved.get
          .chain((initial) =>  fib1.interruptAndWait
            .applySecond(fib2.join)
            .applySecond(moved.get.product(sem.count))
            .map((pair) => [initial, ...pair]))));
    return equiv(io, new Value([0, 2, 0]));
  });
  it("withPermit should return all taken permits", () => {
    const sem = Semaphore.unsafeAlloc(2);
    const io = sem.withPermitsN(2, IO.of(42))
      .product(sem.count);
    return equiv(io, new Value([42, 2]));
  });
});
