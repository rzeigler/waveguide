// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
