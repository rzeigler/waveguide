import { IO } from "../io";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv, equivIO } from "./lib.spec";

describe("Runtime", () => {
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
  });
});
