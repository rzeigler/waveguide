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

import { Value } from "../src/exit";
import { succeed } from "../src/io";
import { makeRef, Ref } from "../src/ref";
import { from, Resource } from "../src/resource";
import { expectExit } from "./tools.spec";

describe("Resource", () => {
  it("should bracket as expected", () => {
    function makeBracket(ref: Ref<string[]>, s: string): Resource<never, string> {
      return from(
        ref.update((ss) => [...ss, s]).as(s),
        (c) => ref.update((ss) => ss.filter((v) => v !== c)).unit()
      );
    }
    const eff = makeRef()<string[]>([])
      .chain((ref) => {
        const resources = ["a", "b", "c", "d"].map((r) => makeBracket(ref, r))
          .reduce((l, r) => l.chain((_) => r));
        return resources.use((v) =>
          ref.get.zip(succeed(v))
        ).zip(ref.get);
      });
    return expectExit(eff, new Value([[["a", "b", "c", "d"], "d"], []]));
  });
});
