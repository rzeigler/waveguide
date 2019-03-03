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

import { OneShot } from "../oneshot";

describe("OneShot", () => {
  it("should invoke continuations on set", () => {
    let result: string | undefined;
    const one = new OneShot<string>();
    one.listen((v) => {
      result = v;
    });
    one.set("b");
    expect(result).to.equal("b");
  });
  it("should allow unlistening", () => {
    let result: string | undefined;
    const one = new OneShot<string>();
    const listen = (v: string) => {
      result = v;
    };
    one.listen(listen);
    one.unlisten(listen);
    one.set("b");
    expect(result).to.equal(undefined);
  });
});
