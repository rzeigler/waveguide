import { Deferred } from "../deferred";
import { Value } from "../result";
import { equiv } from "./lib.spec";

describe("Deferred", () => {
  it("should block until fulfilled", () => {
    const io = Deferred.alloc<number>()
      .chain((defer) =>
        defer.set(100).delay(1000).fork()
          .applySecond(defer.get)
      );
    equiv(io, new Value(100));
  });
});
