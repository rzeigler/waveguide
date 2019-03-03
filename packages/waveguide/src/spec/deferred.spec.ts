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

import { Deferred } from "../deferred";
import { IO } from "../io";
import { Value } from "../result";
import { equiv } from "./lib.spec";

describe("Deferred", () => {
  it("should block until fulfilled", () => {
    const io = Deferred.alloc<number>()
      .chain((defer) =>
        defer.fill(100).delay(100).fork()
          .applySecond(defer.wait)
      );
    equiv(io, new Value(100));
  });

  it("should allow cross fiber messaging", () => {
    const deferred = Deferred.unsafeAlloc<void>();
    const fibIO1 = deferred.fill(undefined).delay(50);
    const fibIO2 = deferred.wait.yield_().as(42);
    const io = fibIO1.fork()
      .applySecond(fibIO2.fork().chain((fib2) => fib2.wait));
    return equiv(io, new Value(new Value(42)));
  });

  it("experimenting with multiple deferreds", () => {
    const d1 = Deferred.unsafeAlloc<void>();
    const d2 = Deferred.unsafeAlloc<void>();
    const fibIO1 = d1.wait.interrupted(d2.fill(undefined));
    const fibIO2 = d2.wait.as(42);
    const io =
      fibIO1.fork().chain((fib1) =>
        fibIO2.fork().chain((fib2) => fib1.interruptAndWait.delay(10).applySecond(fib2.join)));
    return equiv(io, new Value(42));
  });
});
