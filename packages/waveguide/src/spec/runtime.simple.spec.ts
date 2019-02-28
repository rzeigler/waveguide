import { IO } from "../io";
import { Raise, Value } from "../result";
import { equiv } from "./lib.spec";

describe("Runtime", () => {
  describe("simple expressions", () => {
    it("should eval of", () => {
      return equiv(IO.of(42), new Value(42));
    });
    it("should eval sync", () => {
      return equiv(IO.eval(() => 42), new Value(42));
    });
    it("should eval async", () => {
      return equiv(IO.of(42).yield_(), new Value(42));
    });
    it("should eval sync chain", () => {
      return equiv(IO.of(41).map((n) => n + 1), new Value(42));
    });
    it("should eval async chain", () => {
      return equiv(IO.of(41).yield_().map((n) => n + 1), new Value(42));
    });
    it("should eval failed", () => {
      return equiv(IO.failed("boom!"), new Raise("boom!"));
    });
    it("should eval recovering from errors", () => {
      const io = IO.failed("42").chainError((n) => IO.of(parseInt(n, 10)));
      return equiv(io, new Value(42));
    });
    it("should allow up to 10000 map calls", () => {
      const f = (n: number) => n + 1;
      let io = IO.of(0);
      for (let i = 0; i < 10000; i++) {
        io = io.map(f);
      }
      return equiv(io, new Value(10000));
    });
    it("should allow up to 10000 applySecond calls", () => {
      let io = IO.of(0);
      for (let i = 0; i < 10000; i++) {
        io = io.applySecond(IO.of(i));
      }
      return equiv(io, new Value(9999));
    });
  });
});
