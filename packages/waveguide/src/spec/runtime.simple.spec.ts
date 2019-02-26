import { left, right } from "fp-ts/lib/Either";
import { Raise } from "../cause";
import { failed, of, sync } from "../io";
import { unsafeRef } from "../ref";
import { equiv } from "./lib.spec";

describe("Runtime", () => {
  describe("simple expressions", () => {
    it("should eval of", () => {
      return equiv(of(42), right(42));
    });
    it("should eval sync", () => {
      return equiv(sync(() => 42), right(42));
    });
    it("should eval async", () => {
      return equiv(of(42).shift(), right(42));
    });
    it("should eval sync chain", () => {
      return equiv(of(41).map((n) => n + 1), right(42));
    });
    it("should eval async chain", () => {
      return equiv(of(41).shift().map((n) => n + 1), right(42));
    });
    it("should eval failed", () => {
      return equiv(failed("boom!"), left(new Raise("boom!")));
    });
  });
});
