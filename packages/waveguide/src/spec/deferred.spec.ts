import { Deferred } from "../deferred";
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
});
