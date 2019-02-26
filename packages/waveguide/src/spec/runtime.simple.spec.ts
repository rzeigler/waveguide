import { left, right } from "fp-ts/lib/Either";
import { Raise } from "../cause";
import { errorSyntax, failed, of, sync, syntax } from "../io";
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
    it("should eval recovering from errors", () => {
      const io = errorSyntax<number>().failed("42").chainError((n) => syntax<string>().of(parseInt(n, 10)));
      return equiv(io, right(42));
    });
  });
});
