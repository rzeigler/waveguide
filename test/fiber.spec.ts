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
import { makeDeferred } from "../src/deferred";
import { done, interrupt } from "../src/exit";
import { io, never, succeedWith } from "../src/io";
import { makeRef } from "../src/ref";
import { arbEitherIO, eqvIO, expectExit } from "./tools.spec";

describe("fiber", () => {
  it("fibers are joinable", () =>
    expectExit(
      succeedWith(42).delay(10)
        .fork().chain((fiber) => fiber.join),
      done(42)
    )
  );
  it("fibers are interruptible", () =>
    expectExit(
      never.fork()
        .chain((fiber) =>
          fiber.interrupt.delay(10)
            .applySecond(fiber.wait)),
      done(interrupt)
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
              Do(io)
                .bind("latch", makeDeferred<never, void>())
                .bind("cell", makeRef()(false))
                .bindL("child", ({latch, cell}) =>
                  latch.wait.applySecond(cell.set(true)).uninterruptible().fork()
                )
                .bindL("result", ({latch, cell, child}) =>
                  // Interrupt the child first, this always happens before latch release
                  child.interrupt.shiftAsync().fork()
                  // Then release the latch
                  .applySecond(latch.done(undefined).delay(delay))
                  // Then wait for the child to complete
                  .applySecond(child.wait)
                  // Then ensure child ran to completion
                  .applySecond(cell.get))
                .return(({result}) => result),
              done(true)
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
              makeDeferred<never, void>()
                .chain((latch) =>
                  latch.wait.as(42).fork()
                    .chain((child) =>
                      child.interrupt.fork()
                        .applySecond(latch.done(undefined).delay(delay))
                        .applySecond(child.wait)
                    )
                ),
              done(interrupt)
            )
        )
      )
    );
  });
});
