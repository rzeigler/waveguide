import { right } from "fp-ts/lib/Either";
import { unsafeRef } from "../ref";
import { equiv } from "./lib.spec";

describe("Runtime", () => {
  describe("resource management", () => {
    it("should eval finally", () => {
      const ref = unsafeRef(42);
      const io = ref.modify((n) => n + 1).ensuring(ref.modify((n) => n - 1).shift()).applySecond(ref.get);
      return equiv(io, right(42));
    });
  });
});
