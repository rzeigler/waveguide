import { right } from "fp-ts/lib/Either";
import { of, shift } from "../io";
import { unsafeRef } from "../ref";
import { equiv, equivIO } from "./lib.spec";

describe("Runtime", () => {
  describe("fibers", () => {
    it("spawn/join should be equivalent to simple", () => {
      const base = of(42).delay(10);
      const fiber = base.fork().chain((f) => f.join);
      return equivIO(base, fiber);
    });
    it("should provide for termination", () => {
      const ref = unsafeRef(42);
      const handle = shift().applySecond(ref.set(-42).delay(50));
      const io = handle.fork()
        .chain((fiber) => fiber.interrupt.delay(10).applySecond(ref.get.delay(60)));
      return equiv(io, right(42));
    });
  });
});
