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

import { done } from "../src/exit";
import * as io from "../src/io";
import { makeRef, Ref } from "../src/ref";
import { Managed } from "../src/resource";
import * as rsc from "../src/resource";
import { expectExit } from "./tools.spec";
import { DefaultR } from "../src/io";

describe("Resource", () => {
    it("should bracket as expected", () => {
        function makeBracket(ref: Ref<string[]>, s: string): Managed<DefaultR, never, string> {
            return rsc.bracket(
                io.as(ref.update((ss) => [...ss, s]), s),
                (c) => io.asUnit(ref.update((ss) => ss.filter((v) => v !== c)))
            );
        }
        const eff = io.chain(makeRef()<string[]>([]),
            (ref) => {
                const resources = ["a", "b", "c", "d"].map((r) => makeBracket(ref, r))
                    .reduce((l, r) => rsc.chain(l, (_) => r));
                return io.zip(
                    rsc.use(resources, (v) =>
                        io.zip(ref.get, io.pure(v))
                    ),
                    ref.get
                );
            });
        return expectExit(eff, done([[["a", "b", "c", "d"], "d"], []]));
    });
});
