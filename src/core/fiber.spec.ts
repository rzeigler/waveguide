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

import fc from "fast-check";
import { deferred } from "../concurrent/deferred";
import { Interrupted, Value } from "./exit";
import { IO, io } from "./io";
import { arbEitherIO, arbIO, eqvIO, expectExit } from "./tools.spec";

describe("fiber", () => {
  it("fibers are joinable", () =>
    expectExit(
      io.succeed(42).delay(10)
        .fork().chain((fiber) => fiber.join),
      new Value(42)
    )
  );
  it("fibers are interruptible", () =>
    expectExit(
      io.never.fork()
        .chain((fiber) =>
          fiber.interrupt.delay(10)
            .applySecond(fiber.exit)),
      new Value(new Interrupted())
    )
  );
  describe("properties", function () {
    this.timeout(5000);
    it("fork/join is the same result as initial", () =>
      fc.assert(
        fc.asyncProperty(
          arbEitherIO(fc.string(), fc.integer()),
          (inner) => eqvIO(
            inner.run(),
            inner.fork().chain((fiber) => fiber.exit)
          )
        ),
        { verbose: true }
      )
    );
    // Fuzz timing effects
    it("uninterruptible fibers are not uninterruptible", () =>
      fc.assert(
        fc.asyncProperty(
          fc.integer(0, 50),
          (delay) =>
            expectExit(
              deferred.alloc<void>()
                .chain((latch) =>
                  latch.wait.as(42).uninterruptible().fork()
                    .chain((child) =>
                      child.interrupt.fork()
                        .applySecond(latch.complete(undefined).delay(delay))
                        .applySecond(child.exit)
                    )
                ),
              new Value(new Value(42))
            )
        )
      )
    );
    // Counter-example from above
    it("interruptible fibers are interruptible", () =>
      fc.assert(
        fc.asyncProperty(
          fc.integer(0, 50),
          (delay) =>
            expectExit(
              deferred.alloc<void>()
                .chain((latch) =>
                  latch.wait.as(42).fork()
                    .chain((child) =>
                      child.interrupt.fork()
                        .applySecond(latch.complete(undefined).delay(delay))
                        .applySecond(child.exit)
                    )
                ),
              new Value(new Interrupted())
            )
        )
      )
    );
  });
});
