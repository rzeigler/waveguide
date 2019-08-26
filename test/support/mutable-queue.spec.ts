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
import { mutableQueue } from "../../src/support/mutable-queue";

describe("MutableQueue", () => {
  describe("#dequeue", () => {
    it("returns undefined when empty", () => {
      const q = mutableQueue<number>();
      expect(q.dequeue()).to.equal(undefined);
    });
    it("returns undefined when drained", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.dequeue();
      expect(q.dequeue()).to.equal(undefined);
    });
    it("returns elements in fifo order", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.enqueue(2);
      expect(q.dequeue()).to.equal(1);
      expect(q.dequeue()).to.equal(2);
    });
    it("returns elements in fifo order with interleaved dequeue", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.enqueue(2);
      expect(q.dequeue()).to.equal(1);
      q.enqueue(3);
      expect(q.dequeue()).to.equal(2);
      expect(q.dequeue()).to.equal(3);
    });
  });
  describe("#size/#isEmpty", () => {
    it("returns 0 when empty", () => {
      const q = mutableQueue<number>();
      expect(q.size()).to.equal(0);
      expect(q.isEmpty()).to.equal(true);
    });
    it("returns the size of the queue", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.enqueue(2);
      expect(q.size()).to.equal(2);
      expect(q.isEmpty()).to.equal(false);
    });
    it("returns the size of the queue after dequeue", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.dequeue();
      expect(q.size()).to.equal(1);
      expect(q.isEmpty()).to.equal(false);
    });
  });
  describe("peek", () => {
    it("returns undefined on empty", () => {
      const q = mutableQueue();
      expect(q.peek()).to.equal(undefined);
    });
    it("returns the next item", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      expect(q.peek()).to.equal(1);
      expect(q.dequeue()).to.equal(1);
      expect(q.isEmpty()).to.equal(true);
    });
    it("returns the next item after dequeues", () => {
      const q = mutableQueue<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.dequeue();
      expect(q.peek()).to.equal(2);
      expect(q.dequeue()).to.equal(2);
      expect(q.isEmpty()).to.equal(true);
    });
  });
});
