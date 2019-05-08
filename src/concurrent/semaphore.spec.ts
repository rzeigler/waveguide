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

import fc, {Arbitrary} from "fast-check";
import { Do } from "fp-ts-contrib/lib/Do";
import { array } from "fp-ts/lib/Array";
import { Interrupted, Value } from "../core/exit";
import { io } from "../core/io";
import { expectExit } from "../core/tools.spec";
import { ref } from "./ref";
import { semaphore } from "./semaphore";

describe("semaphore", () => {
  it("acquire is observable", () => {
    const eff = Do(io.monad)
      .bind("sem", semaphore.alloc(4))
      .doL(({sem}) => sem.acquireN(3).fork())
      .do(io.shift)
      .bindL("avail", ({sem}) => sem.available)
      .return(({avail}) => avail);
    return expectExit(eff, new Value(1));
  });
  it("release is observable", () => {
    const eff = Do(io.monad)
      .bind("sem", semaphore.alloc(4))
      .doL(({sem}) => sem.releaseN(3).fork())
      .do(io.shift)
      .bindL("avail", ({sem}) => sem.available)
      .return(({avail}) => avail);
    return expectExit(eff, new Value(7));
  });
  it("should block acquisition", () => {
    const eff = Do(io.monad)
      .bind("gate", ref.alloc(false))
      .bind("sem", semaphore.alloc(0))
      .doL(({gate, sem}) => sem.withPermit(gate.set(true)).fork())
      .bindL("before", ({gate}) => gate.get)
      .doL(({sem}) => sem.release)
      .do(io.shift) // let the forked fiber advance
      .bindL("after", ({gate, sem}) => gate.get.zip(sem.available))
      .return(({before, after}) => [before, ...after]);
    return expectExit(eff, new Value([false, true, 1]));
  });
  it("should allow acquire to be interruptible", () => {
    const eff = Do(io.monad)
      .bind("gate", ref.alloc(false))
      .bind("sem", semaphore.alloc(1))
      .bindL("child", ({sem, gate}) => sem.acquireN(2).applySecond(gate.set(true)).fork())
      .bindL("exit", ({child}) => child.interrupt.applySecond(child.wait))
      .bindL("state", ({sem, gate}) => sem.available.zip(gate.get))
      .return(({exit, state}) => [exit, ...state]);
    return expectExit(eff, new Value([new Interrupted(), 1, false]));
  });
  it("interrupts should release acquired permits for subsequent acquires to advance", () => {
    const eff = Do(io.monad)
      .bind("turnstyle", ref.alloc(0))
      .bind("sem", semaphore.alloc(2))
      .bindL("child1", ({sem, turnstyle}) => sem.acquireN(3).applySecond(turnstyle.set(1)).fork())
      .bindL("child2", ({sem, turnstyle}) => sem.acquireN(2).applySecond(turnstyle.set(2)).fork())
      .do(io.shiftAsync)
      .bindL("moved", ({turnstyle}) => turnstyle.get)
      .doL(({child1}) => child1.interrupt)
      .bindL("c2exit", ({child2}) => child2.wait)
      .bindL("after", ({turnstyle}) => turnstyle.get)
      .return(({c2exit, moved, after}) => ({c2exit: c2exit._tag, moved, after}));
    return expectExit(eff, new Value({c2exit: "value", moved: 0, after: 2}));
  });
  it("withPermitsN is interruptible", () => {
    const eff = Do(io.monad)
      .bind("sem", semaphore.alloc(1))
      .bindL("child", ({sem}) => sem.acquireN(2).fork())
      .do(io.shift)
      .bindL("before", ({sem}) => sem.available)
      .doL(({child}) => child.interrupt)
      .bindL("after", ({sem}) => sem.available)
      .return(({before, after}) => ({before, after}));
    return expectExit(eff, new Value({before: -1, after: 1}));
  });
  describe("properties", function() {
    this.timeout(20000);
    it("never deadlocks", () =>
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.tuple(fc.nat(100), fc.nat(10), fc.nat(10), fc.boolean()), 100),
          (acquires) => {
            const eff = semaphore.alloc(100)
              .chain((sem) =>
                array.traverse(io.monad)(acquires, ([n, pre, post, int]) =>
                  sem.withPermitsN(n, (int ? io.interrupted : io.unit.delay(post))).delay(pre).fork()
                ).chain((fibers) =>
                  array.traverse(io.monad)(fibers, (f) => f.wait)
                ).applySecond(sem.available)
              );
            return expectExit(eff, new Value(100));
        })
      )
    );
  });
});
