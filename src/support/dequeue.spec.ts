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
import fc, {Arbitrary, Command} from "fast-check";
import { Do } from "fp-ts-contrib/lib/Do";
import { none, some, Some } from "fp-ts/lib/Option";
import { dequeue, Dequeue } from "./dequeue";

describe.only("Dequeue", () => {
  it("take on empty is none", () => {
    expect(dequeue.empty().take()).to.deep.equal(none);
  });
  it("pull on empty is none", () => {
    expect(dequeue.empty().pull()).to.deep.equal(none);
  });
  it("take after offer is a value", () => {
    const queue = dequeue.empty().offer(42);
    const result = queue.take();
    expect(result).to.deep.equal(some([42, dequeue.empty()]));
  });
  it("pull after offer is a value", () => {
    const queue = dequeue.empty().offer(42);
    const result = queue.pull();
    result.foldL(
      () => { throw new Error("expected some"); },
      (tuple) => expect(tuple[0]).to.equal(42)
    );
  });
  it("take after multiple offers is the first", () => {
    const queue = dequeue.empty()
      .offer(42)
      .offer(43)
      .offer(44);
    const result = queue.take();
    result.foldL(
      () => { throw new Error("expected some"); },
      (tuple) => {
        expect(tuple[0]).to.equal(42);
        expect(tuple[1].size()).to.equal(2);
      }
    );
  });
  it("pull after multiple offers is the last", () => {
    const queue = dequeue.empty()
      .offer(42)
      .offer(43)
      .offer(44);
    const result = queue.pull();
    result.foldL(
      () => { throw new Error("expected some"); },
      (tuple) => {
        expect(tuple[0]).to.equal(44);
        expect(tuple[1].size()).to.equal(2);
      }
    );
  });

  interface Model {
    fake: number[];
  }
  interface Real {
    actual: Dequeue<number>;
  }

  const commandArb: Arbitrary<Command<Model, Real>> = 
    fc.tuple(fc.constantFrom("push", "pull", "offer", "take"), fc.nat())
      .map(([command, n]) => {
        if (command === "push") {
          return {
            check(m: Model): boolean {
              return true;
            },
            run(m: Model, r: Real): void {
              m.fake.push(n);
              r.actual = r.actual.push(n);
            },
            toString() {
              return `push $n`;
            }
          };
        }
        throw new Error();
      })
});
