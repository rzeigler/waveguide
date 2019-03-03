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

import { IO } from "../io";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv, equivIO } from "./lib.spec";

describe("IO", () => {
  describe("fibers", () => {
    it("spawn/join should be equivalent to simple", () => {
      const base = IO.of(42).delay(10);
      const fiber = base.fork().chain((f) => f.join);
      return equivIO(base, fiber);
    });
    it("should provide for termination", () => {
      const ref = Ref.unsafeAlloc(42);
      const handle = IO.yield_().applySecond(ref.set(-42).delay(50));
      const io = handle.fork()
        .chain((fiber) => fiber.interrupt.delay(10).applySecond(ref.get.delay(60)));
      return equiv(io, new Value(42));
    });
    it("interruption of a complete fiber should do nothing", () => {
      const io = IO.of(42).fork()
        .chain((fib) => fib.wait.product(fib.interruptAndWait))
        .map(([r1, r2]) => r1._tag === r2._tag);
      return equiv(io, new Value(true));
    });
  });
});
