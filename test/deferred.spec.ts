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
import { makeDeferred  } from "../src/deferred";
import { done, ExitTag, raise } from "../src/exit";
import * as io from "../src/io";
import { eqvIO, expectExit, expectExitIn } from "./tools.spec";

describe("Deferred", () => {
    it("can bet set", () =>
        eqvIO(
            io.chain(makeDeferred<never, number>(),
                (def) =>
                    io.applySecond(def.done(42), def.wait)
            ),
            io.pure(42)
        )
    );
    it("can proxy errors", () =>
        expectExit(
            io.chain(makeDeferred<string, number>(),
                (def) => io.applySecond(def.error("boom"), def.wait)),
            raise("boom")
        )
    )
    it("multiple sets fail", () =>
        expectExitIn(
            io.chain(makeDeferred<never, number>(),
                (def) => {
                    const c42 = def.done(42);
                    return io.applySecond(c42, c42);
                }),
            (exit) => exit._tag === ExitTag.Abort ? (exit.abortedWith as Error).message : undefined,
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
                            io.chain(makeDeferred<never, number>(),
                                (def) =>
                                    io.applySecond(
                                        io.fork(io.delay(def.done(42), delay)),
                                        def.wait
                                    )
                            ),
                            done(42)
                        )

                )
            )
        );
    });
});
