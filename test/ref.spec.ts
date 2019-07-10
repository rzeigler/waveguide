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
import { array } from "fp-ts/lib/Array";
import * as io from "../src/io";
import { makeRef } from "../src/ref";
import { eqvIO } from "./tools.spec";

describe("Ref", function() {
    this.timeout(5000);
    it("should be initialized with a value", () =>
        eqvIO(
            io.chain(makeRef()(42), (r) => r.get),
            io.pure(42)
        )
    );
    describe("properties", () => {
        it("- last set wins", () =>
            fc.assert(
                fc.asyncProperty(
                    fc.nat(),
                    fc.array(fc.nat(), 1, 10),
                    (initial, sets) =>
                        eqvIO(
                            io.chain(makeRef()(initial),
                                (r) => io.applySecond(array.traverse(io.instances)(sets, (v) => r.set(v)), r.get)),
                            io.chain(makeRef()(initial),
                                (r) => io.applySecond(r.set(sets[sets.length - 1]), r.get))
                        )
                )
            )
        );
        function repeat<A>(v: A, count: number): A[] {
            const as = [];
            for (let i = 0; i < count; i++) {
                as.push(v);
            }
            return as;
        }
        it("- duplicated sets are equivalent", () =>
            fc.assert(
                fc.asyncProperty(
                    fc.nat(),
                    fc.nat(),
                    fc.nat(1000),
                    (initial, value, count) =>
                        eqvIO(
                            io.chain(makeRef()(initial),
                                (cell) => io.applySecond(cell.set(value), cell.get)),
                            io.chain(makeRef()(initial),
                                (cell) =>
                                    io.applySecond(
                                        array.traverse(io.instances)(repeat(value, count + 1), (v) => cell.set(v)),
                                        cell.get)
                            )
                        )
                )
            )
        );
        it("- set returns the previous value", () =>
            fc.assert(
                fc.asyncProperty(
                    fc.nat(),
                    fc.nat(),
                    (before, after) =>
                        eqvIO(
                            io.chain(makeRef()(before),
                                (cell) => cell.set(after)),
                            io.chain(makeRef()(before),
                                (cell) => cell.get)
                        )
                )
            )
        );
    });
});
