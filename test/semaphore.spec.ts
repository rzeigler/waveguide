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
import { pipe } from "fp-ts/lib/pipeable";
import { done, interrupt} from "../src/exit";
import * as io from "../src/io";
import { makeRef } from "../src/ref";
import { makeSemaphore } from "../src/semaphore";
import { expectExit } from "./tools.spec";

describe("semaphore", () => {
  it("acquire is observable", () => {
    const eff = Do(io.instances)
      .bind("sem", makeSemaphore(4))
      .doL(({sem}) => io.fork(sem.acquireN(3)))
      .do(io.shifted)
      .bindL("avail", ({sem}) => sem.available)
      .return(({avail}) => avail);
    return expectExit(eff, done(1));
  });
  it("release is observable", () => {
    const eff = Do(io.instances)
      .bind("sem", makeSemaphore(4))
      .doL(({sem}) => io.fork(sem.releaseN(3)))
      .do(io.shifted)
      .bindL("avail", ({sem}) => sem.available)
      .return(({avail}) => avail);
    return expectExit(eff, done(7));
  });
  it("should block acquisition", () => {
    const eff = Do(io.instances)
      .bind("gate", makeRef()(false))
      .bind("sem", makeSemaphore(0))
      .doL(({gate, sem}) => io.fork(sem.withPermit(gate.set(true))))
      .bindL("before", ({gate}) => gate.get)
      .doL(({sem}) => sem.release)
      .do(io.shifted) // let the forked fiber advance
      .bindL("after", ({gate, sem}) => io.zip(gate.get, sem.available))
      .return(({before, after}) => [before, ...after]);
    return expectExit(eff, done([false, true, 1]));
  });
  it("should allow acquire to be interruptible", () => {
    const eff1 =
      io.chain(makeRef()(false),
        (gate) =>
          io.chain(makeSemaphore(1),
            (sem) =>
              io.chain(io.fork(io.applySecond(sem.acquireN(2), gate.set(true))),
                (child) =>
                  io.chain(io.applySecond(child.interrupt, child.wait),
                    (exit) => io.zip(sem.available, gate.get)
                  )
              )
          )
      );
    return expectExit(eff1, done([1, false]));
  });
  it("interrupts should release acquired permits for subsequent acquires to advance", () => {
    const eff = Do(io.instances)
      .bind("turnstyle", makeRef()(0))
      .bind("sem", makeSemaphore(2))
      .bindL("child1", ({sem, turnstyle}) => io.fork(io.applySecond(sem.acquireN(3), turnstyle.set(1))))
      .bindL("child2", ({sem, turnstyle}) => io.fork(io.applySecond(sem.acquireN(2), turnstyle.set(2))))
      .do(io.shiftedAsync)
      .bindL("moved", ({turnstyle}) => turnstyle.get)
      .doL(({child1}) => child1.interrupt)
      .bindL("c2exit", ({child2}) => child2.wait)
      .bindL("after", ({turnstyle}) => turnstyle.get)
      .return(({c2exit, moved, after}) => ({c2exit: c2exit._tag, moved, after}));
    return expectExit(eff, done({c2exit: "value", moved: 0, after: 2}));
  });
  it("withPermitsN is interruptible", () => {
    const eff = Do(io.instances)
      .bind("sem", makeSemaphore(1))
      .bindL("child", ({sem}) => io.fork(sem.acquireN(2)))
      .do(io.shifted)
      .bindL("before", ({sem}) => sem.available)
      .doL(({child}) => child.interrupt)
      .bindL("after", ({sem}) => sem.available)
      .return(({before, after}) => ({before, after}));
    return expectExit(eff, done({before: -1, after: 1}));
  });
  describe("properties", function() {
    this.timeout(20000);
    it("never deadlocks", () =>
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.tuple(fc.nat(100), fc.nat(10), fc.nat(10), fc.boolean()), 100),
          (acquires) => {
            const eff = io.chain(makeSemaphore(100),
              (sem) =>
                pipe(
                  array.traverse(io.instances)(acquires, ([n, pre, post, int]) =>
                    sem.withPermitsN(n, pipe(
                      (int ? io.raiseInterrupt : io.after(post)),
                      io.liftDelay(pre),
                      io.fork
                    ))
                  ),
                  io.chainWith((fibers) => array.traverse(io.instances)(fibers, (f) => f.wait)),
                  (result) => io.applySecond(result, sem.available)
                )
              );
            return expectExit(eff, done(100));
        })
      )
    );
  });
});
