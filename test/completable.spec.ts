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

import { expect } from "chai";
import { completable } from "../src/support/completable";

describe("Completable", () => {
  it("completions should be visible to observers registered after complete", () => {
    let n: number | undefined;
    const c = completable<number>();
    c.complete(1);
    c.listen((v) => n = v);
    expect(n).to.equal(1);
  });
  it("completions should be visible to observers registered before complete", () => {
    let n: number | undefined;
    const c = completable<number>();
    c.listen((v) => n = v);
    c.complete(1);
    expect(n).to.equal(1);
  });
  it("multiple completions should error", () => {
    const c = completable<number>();
    c.complete(1);
    expect(() => c.complete(2)).to.throw();
  });
});
