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
import { none, some } from "fp-ts/lib/Option";
import { concat, cons, filter, find, flatten, fromArray, nil, of } from "../../src/support/list";

function isEven(n: number): boolean {
  return n % 2 === 0;
}

describe("List", () => {
  describe("fromArray", () => {
    it("should convert from arrays", () => {
      expect(fromArray([1, 2, 3])).to.deep.equal(cons(1, cons(2, cons(3, nil))));
    });
  });
  describe("concat", () => {
    it("should concat", () => {
      const test = concat(fromArray([1, 2]), fromArray([3, 4]));
      const result = fromArray([1, 2, 3, 4]);
      expect(test).to.deep.equal(result);
    });
  });
  describe("flatten", () => {
    it("should flatten", () => {
      const test = flatten(fromArray([fromArray([1]), fromArray([3])]));
      const result = fromArray([1, 3]);
      expect(test).to.deep.equal(result);
    });
  });
  describe("filter", () => {
    it("should filter", () => {
      expect(filter(fromArray([1, 2, 3]), isEven)).to.deep.equal(of(2));
    });
  });
  describe("find", () => {
    it("should find", () => {
      expect(find(fromArray([1, 2, 3]), isEven)).to.deep.equal(some(2));
    });
    it("should not find something not there", () => {
      expect(find(fromArray([1, 3, 5]), isEven)).to.deep.equal(none);
    });
  });
});
