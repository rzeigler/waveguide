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
import { none } from "fp-ts/lib/Option";
import { Value } from "../core/exit";
import { io } from "../core/io";
import { eqvIO, expectExit, expectExitIn } from "../core/tools.spec";
import { deferred } from "./deferred";

describe("Deferred", () => {
  it("can bet set", () =>
    eqvIO(
      deferred.alloc<never, number>()
        .chain((def) =>
          def.complete(42).applySecond(def.wait)
        ),
      io.succeed(42)
    )
  );
  it("multiple sets fail", () =>
      expectExitIn(
        deferred.alloc<never, number>()
          .chain((def) => {
            const c42 = def.complete(42);
            return c42.applySecond(c42);
          }),
        (exit) => exit._tag === "aborted" ? (exit.error as Error).message : undefined,
        "Die: Completable is already completed"
      )
  );
  describe("properties", function() {
    this.timeout(5000);
    it("allows for multiple fibers to coordinate", () =>
      fc.assert(
        fc.asyncProperty(
          fc.nat(50),
          (delay) =>
            expectExit(
              deferred.alloc<never, number>()
                .chain((def) =>
                  def.complete(42).delay(delay).fork()
                    .applySecond(def.wait)
                ),
              new Value(42)
            )

        )
      )
    );
  });
});
