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
import { Do } from "fp-ts-contrib/lib/Do";
import { deferred } from "../concurrent/deferred";
import { ref } from "../concurrent/ref";
import { Interrupted, Value } from "./exit";
import { io } from "./io";
import { arbEitherIO, eqvIO, expectExit } from "./tools.spec";

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
            .applySecond(fiber.wait)),
      new Value(new Interrupted())
    )
  );
  describe("properties", function() {
    this.timeout(5000);
    it("fork/join is the same result as initial", () =>
      fc.assert(
        fc.asyncProperty(
          arbEitherIO(fc.string(), fc.integer()),
          (inner) => eqvIO(
            inner.result(),
            inner.fork().chain((fiber) => fiber.wait)
          )
        ),
        { verbose: true }
      )
    );
    // Fuzz timing effects
    it("uninterruptible fibers are not interruptible", () =>
      fc.assert(
        fc.asyncProperty(
          fc.nat(50),
          (delay) =>
            expectExit(
              Do(io.monad)
                .bind("latch", deferred.alloc<never, void>())
                .bind("cell", ref.alloc(false))
                .bindL("child", ({latch, cell}) =>
                  latch.wait.applySecond(cell.set(true)).uninterruptible().fork()
                )
                .bindL("result", ({latch, cell, child}) =>
                  // Interrupt the child first, this always happens before latch release
                  child.interrupt.shiftAsync().fork()
                  // Then release the latch
                  .applySecond(latch.succeed(undefined).delay(delay))
                  // Then wait for the child to complete
                  .applySecond(child.wait)
                  // Then ensure child ran to completion
                  .applySecond(cell.get))
                .return(({result}) => result),
              new Value(true)
            )
        ),
        {verbose: true}
      )
    );
    // Counter-example from above
    it("interruptible fibers are interruptible", () =>
      fc.assert(
        fc.asyncProperty(
          fc.integer(0, 50),
          (delay) =>
            expectExit(
              deferred.alloc<never, void>()
                .chain((latch) =>
                  latch.wait.as(42).fork()
                    .chain((child) =>
                      child.interrupt.fork()
                        .applySecond(latch.succeed(undefined).delay(delay))
                        .applySecond(child.wait)
                    )
                ),
              new Value(new Interrupted())
            )
        )
      )
    );
  });
});
