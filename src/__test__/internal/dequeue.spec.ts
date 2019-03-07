// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import { Dequeue } from "../../internal/queue";

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
