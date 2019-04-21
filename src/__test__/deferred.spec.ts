// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Deferred } from "../deferred";
import { Value } from "../result";
import { equiv } from "./lib.spec";

describe("Deferred", () => {
  it("should block until fulfilled", () => {
    const io = Deferred.alloc<number>()
      .chain((defer) =>
        defer.complete(100).delay(100).fork()
          .applySecond(defer.get)
      );
    equiv(io, new Value(100));
  });

  it("should allow cross fiber messaging", () => {
    const deferred = Deferred.unsafeAlloc<void>();
    const fibIO1 = deferred.complete(undefined).delay(50);
    const fibIO2 = deferred.get.yield_().as(42);
    const io = fibIO1.fork()
      .applySecond(fibIO2.fork().chain((fib2) => fib2.wait));
    return equiv(io, new Value(new Value(42)));
  });

  it("experimenting with multiple deferreds", () => {
    const d1 = Deferred.unsafeAlloc<void>();
    const d2 = Deferred.unsafeAlloc<void>();
    const fibIO1 = d1.get.onInterrupt(d2.complete(undefined));
    const fibIO2 = d2.get.as(42);
    const io =
      fibIO1.fork().chain((fib1) =>
        fibIO2.fork().chain((fib2) => fib1.interruptAndWait.delay(10).applySecond(fib2.join)));
    return equiv(io, new Value(42));
  });
});
