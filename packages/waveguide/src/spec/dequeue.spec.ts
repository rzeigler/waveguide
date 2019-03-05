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
import { Dequeue } from "../internal/queue";

describe("Dequeue", () => {
  it("should provide dequeue", () => {
    const [next, updated] = Dequeue.ofAll([1, 2, 3]).dequeue();
    expect(next).to.equal(1);
    expect(updated.array).to.deep.equal([2, 3]);
  });
  it("should dequeue undefined when nothing exists", () => {
    const [next, updated] = Dequeue.empty().dequeue();
    expect(next).to.equal(undefined);
    expect(updated.array).to.deep.equal([]);
  });
  it("should provide enqueue", () => {
    const updated = Dequeue.ofAll([1, 2]).enqueue(3);
    expect(updated.array).to.deep.equal([1, 2, 3]);
  });
  it("should provide enqueue head", () => {
    const updated = Dequeue.ofAll([1, 2]).enqueueFront(0);
    expect(updated.array).to.deep.equal([0, 1, 2]);
  });
});
