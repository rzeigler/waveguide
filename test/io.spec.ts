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

import * as fc from "fast-check";
import { array } from "fp-ts/lib/Array";
import { left, right } from "fp-ts/lib/Either";
import { FunctionN, identity, pipe } from "fp-ts/lib/function";
import {abort, done, interrupt, raise } from "../src/exit";
import { abortWith, async, asyncTotal, completeWith, effect, getInterruptible, interrupted, interruptible, IO, io,
   never, raiseError, raiseErrorC, succeedWith, succeedWithC, suspend, uninterruptible } from "../src/io";
import { makeRef } from "../src/ref";
import {
  arbConstIO,
  arbEitherIO,
  arbErrorIO,
  arbErrorKleisliIO,
  arbIO,
  arbKleisliIO,
  eqvIO,
  expectExit
} from "./tools.spec";

// Tests for the io module
describe("io", () => {
  describe("#succeed", () => {
    it("should complete with a completed", () =>
      expectExit(succeedWith(42), done(42))
    );
  });
  describe("#fail", () => {
    it("should complete with a failed", () =>
      expectExit(raiseError("boom"), raise("boom"))
    );
  });
  describe("#abort", () => {
    it("should complete with an aborted", () =>
      expectExit(abortWith("boom"), abort("boom"))
    );
  });
  describe("#interrupted", () => {
    it("should complete with an interrupted", () =>
      expectExit(interrupted, interrupt)
    );
  });
  describe("#exitWith", () => {
    it("should complete with a completed when provided", () =>
      expectExit(completeWith(done(42)), done(42))
    );
    it("should complete with a failed when provided", () =>
      expectExit(completeWith(raise("boom")), raise("boom"))
    );
    it("should complete with an aborted when provided", () =>
      expectExit(completeWith(abort("boom")), abort("boom"))
    );
    it("should complete with an interrupted when provided", () =>
      expectExit(completeWith(interrupt), interrupt)
    );
  });
  describe("#effect", () => {
    it("should complete at some a success", () =>
      expectExit(effect(() => 42), done(42))
    );
  });
  describe("#suspend", () => {
    it("should complete with synchronous effects", () =>
      expectExit(suspend(() => succeedWith(42)), done(42))
    );
    it("should complete with asynchronous effects", () =>
      expectExit(suspend(() =>
        asyncTotal((callback) => {
          const handle = setTimeout(() => callback(42), 0);
          return () => { clearTimeout(handle); };
        })
      ), done(42))
    );
  });
  describe("#delay", () => {
    it("should complete with a success eventually", () =>
      expectExit(asyncTotal((callback) => {
        const handle = setTimeout(() => callback(42), 0);
        return () => { clearTimeout(handle); };
      }), done(42))
    );
  });
  describe("#async", () => {
    it("should complete with a success eventually", () =>
      expectExit(async((callback) => {
        const handle = setTimeout(() => callback(right(42)), 0);
        return () => { clearTimeout(handle); };
      }), done(42))
    );
    it("should complete with a failed eventually", () =>
      expectExit(async((callback) => {
        const handle = setTimeout(() => callback(left("boom")), 0);
        return () => { clearTimeout(handle); };
      }), raise("boom"))
    );
  });
  describe("#interrupted", () => {
    it("should complete with interrupted", () =>
      expectExit(interrupted, interrupt)
    );
  });
  describe("#run", () => {
    it("should complete with an expected completion", () =>
      expectExit(succeedWith(42).result(), done(done(42)))
    );
    it("should complete with an expected failure", () =>
      expectExit(raiseError("boom").result(), done(raise("boom")))
    );
    it("should complete with an expected abort", () =>
      expectExit(abortWith("boom").result(), done(abort("boom")))
    );
    /**
     * This may be counter-intruitive, but the interrupted io sets the interrupted flag.
     * Additionally, because of how the driver operates, there is always a at least 1 more action following leaving an
     * uninterruptible region
     * Therefore it is never possible to fully complete a fiber that has been interrupted and we don't get a 'value' as
     * above
     */
    it("should complete with an expected interrupt", () =>
      expectExit(uninterruptible(interrupted.result()), interrupt)
    );
  });
  describe("raceFirstDone", () => {
    it("should resolve with the first success", () =>
      expectExit(succeedWith(42).delay(10).race(never), done(42))
    );
    it("should resolve with the first success (flipped)", () =>
      expectExit(never.widen<number>().race(succeedWith(42).delay(10)), done(42))
    );
    it("should resolve with the first error", () =>
      expectExit(raiseError("boom").delay(10).race(never), raise("boom"))
    );
    it("should resolve with the first error (flipped)", () =>
      expectExit(never.widenError<string>().race(raiseError("boom").delay(10)), raise("boom"))
    );
  });
  describe("raceFirst", () => {
    it("should resolve wih a success", () =>
      expectExit(succeedWith(42).delay(10).raceSuccess(never)
                  .zip(never.widen<number>().raceSuccess(succeedWith(42).delay(14))), done([42, 42]))
    );
    it("should resolve to a success on a failure", () =>
      expectExit(raiseErrorC<number>()("boom!").raceSuccess(succeedWith(42).delay(10)), done(42))
    );
  });
  describe("interruptible state", () => {
    it("should set interrupt status", () =>
      expectExit(
        interruptible(getInterruptible),
        done(true)
      )
    );
    it("should set nested interrupt status", () =>
      expectExit(
        uninterruptible(interruptible(getInterruptible)),
        done(true)
      )
    );
    it("should compose", () =>
      expectExit(
        uninterruptible(interruptible(uninterruptible(getInterruptible))),
        done(false)
      )
    );
    it("should allow setting uninterruptible", () =>
      expectExit(
        uninterruptible(getInterruptible),
        done(false)
      )
    );
  });
  // Property test utils
  // base on fp-ts-laws at https://github.com/gcanti/fp-ts-laws but adapter for the fact that we need to run IOs
  describe("laws", function() {
    this.timeout(60000);
    const strlen: FunctionN<[string], number> = (s: string) => s.length;
    const even: FunctionN<[number], boolean> = (n: number) => n % 2 === 0;

    const functor = {
      identity: <E, A>(ioa: IO<E, A>) => eqvIO(ioa.map(identity), ioa),
      composition: <E, A, B, C>(ioa: IO<E, A>, fab: FunctionN<[A], B>, fbc: FunctionN<[B], C>) =>
        eqvIO(ioa.map(fab).map(fbc), ioa.map(pipe(fab, fbc)))
    };

    const apply = {
      associativeComposition: <E, A, B, C>(ioa: IO<E, A>,
                                           iofab: IO<E, FunctionN<[A], B>>,
                                           iofbc: IO<E, FunctionN<[B], C>>) =>
        eqvIO(
          iofbc.map((bc) => (ab: FunctionN<[A], B>) => (a: A) => bc(ab(a))).ap_(iofab).ap_(ioa),
          iofbc.ap_(iofab.ap_(ioa))
        )
    };

    const applicative = {
      identity: <E, A>(ioa: IO<E, A>) =>
        eqvIO(
          succeedWithC<E>()(identity).ap_(ioa),
          ioa
        ),
      homomorphism: <A, B>(fab: FunctionN<[A], B>, a: A) =>
        eqvIO(
          succeedWith(fab).ap_(succeedWith(a)),
          succeedWith(fab(a))
        ),
      interchange: <E, A, B>(a: A, iofab: IO<E, FunctionN<[A], B>>) =>
        eqvIO(
          iofab.ap_(succeedWith(a)),
          succeedWithC<E>()((ab: FunctionN<[A], B>) => ab(a)).ap_(iofab)
        ),
      derivedMap: <E, A, B>(ab: FunctionN<[A], B>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.map(ab),
          succeedWithC<E>()(ab).ap_(ioa)
        )
    };

    const chain = {
      associativivity: <E, A, B, C>(ioa: IO<E, A>, kab: FunctionN<[A], IO<E, B>>, kbc: FunctionN<[B], IO<E, C>>) =>
        eqvIO(
          ioa.chain(kab).chain(kbc),
          ioa.chain((a) => kab(a).chain(kbc))
        ),
      derivedAp: <E, A, B>(iofab: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.ap(iofab),
          iofab.chain((f) => ioa.map(f))
        )
    };

    const monad = {
      leftIdentity: <E, A, B>(kab: FunctionN<[A], IO<E, B>>, a: A) =>
        eqvIO(
          succeedWithC<E>()(a).chain(kab),
          kab(a)
        ),
      rightIdentity: <E, A>(ioa: IO<E, A>) =>
        eqvIO(
          ioa.chain(succeedWith),
          ioa
        ),
      derivedMap: <E, A, B>(ab: FunctionN<[A], B>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.map(ab),
          ioa.chain((a) => succeedWith(ab(a)))
        )
    };

    describe("Functor", () => {
      it("- identity", () =>
        fc.assert(fc.asyncProperty(arbIO(fc.integer()), functor.identity))
      );
      it("- composition", () =>
        fc.assert(
          fc.asyncProperty(
            arbIO(fc.string()),
            fc.constant(strlen),
            fc.constant(even),
            functor.composition
          )
        )
      );
    });
    describe("Apply", () => {
      it("- associaive composition", () =>
        fc.assert(
          fc.asyncProperty(
            arbIO(fc.string()),
            fc.constant(strlen).map(succeedWith),
            fc.constant(even).map(succeedWith),
            apply.associativeComposition
          )
        )
      );
    });
    describe("Applicative", () => {
      it("- identity", () =>
        fc.assert(
          fc.asyncProperty(
            arbIO(fc.string()),
            applicative.identity
          )
        )
      );
      it("- homomorphism", () =>
        fc.assert(
          fc.asyncProperty(
            fc.constant(strlen),
            fc.string(),
            applicative.homomorphism
          )
        )
      );
      it("- interchange", () =>
        fc.assert(
          fc.asyncProperty(
            fc.string(),
            arbIO(fc.constant(strlen)),
            applicative.interchange
          )
        )
      );
      it("- derived map", () =>
        fc.assert(
          fc.asyncProperty(
            fc.constant(strlen),
            arbIO(fc.string()),
            applicative.derivedMap
          )
        )
      );
    });
    describe("Chain", () => {
      it(" - associativity", () =>
        fc.assert(
          fc.asyncProperty(
            arbIO(fc.string()),
            arbKleisliIO(fc.constant(strlen)),
            arbKleisliIO(fc.constant(even)),
            chain.associativivity
          )
        )
      );
      it(" - derived ap", () =>
        fc.assert(
          fc.asyncProperty(
            fc.constant(strlen).map(succeedWith),
            arbIO(fc.string()),
            chain.derivedAp
          )
        )
      );
    });
    describe("Monad", () => {
      it(" - left identity", () =>
        fc.assert(
          fc.asyncProperty(
            arbKleisliIO(fc.constant(strlen)),
            fc.string(),
            monad.leftIdentity
          )
        )
      );
      it(" - right identity", () =>
        fc.assert(
          fc.asyncProperty(
            arbIO(fc.string()),
            monad.rightIdentity
          )
        )
      );
      it(" - derived map", () =>
        fc.assert(
          fc.asyncProperty(
            fc.constant(strlen),
            arbIO(fc.string()),
            monad.derivedMap
          )
        )
      );
    });
    describe("MonadError", () => {
      const monadError = {
        // The host exists to ensure we are testing in async boundaries
        recoveryEquivalence: <E, E2, A>(host: IO<E2, A>, e: E, kea: FunctionN<[E], IO<E2, A>>) =>
          eqvIO(
           host.chain((_) => raiseErrorC<A>()(e).chainError(kea)),
           host.chain((_) => kea(e))
          )
      };
      it(" - recovery equivalence", () =>
        fc.assert(
          fc.asyncProperty(
            arbConstIO(undefined),
            fc.string(),
            arbErrorKleisliIO(fc.constant(strlen)),
            monadError.recoveryEquivalence
          )
        )
      );
    });
  });

  describe("properties", function() {
    this.timeout(10000);
    it("any number of successful IOs surrounding a failed IO produces the error of the failed IO", () =>
      fc.assert(
        fc.asyncProperty(
          fc.array(arbIO(fc.integer())),
          arbErrorIO(fc.constant("failure")),
          fc.array(arbIO(fc.integer())),
          (before, err, after) =>
            eqvIO(
              array.sequence(io)([...before, err, ...after]),
              err.as([])
            )
        )
      )
    );
  });
  it("many async ios should be parZipWithAble", () => {
    const ios: Array<IO<never, number>> = [];
    for (let i = 0; i < 10000; i++) {
      ios.push(succeedWith(1).delay(Math.random() * 100));
    }
    return eqvIO(
      array.reduce(ios, succeedWith(42), (l, r) => l.parApplyFirst(r)),
      succeedWith(42)
    );
  });
  it("many sync ios should be parZipWithAble", () => {
    const ios: Array<IO<never, number>> = [];
    for (let i = 0; i < 10000; i++) {
      ios.push(succeedWith(1));
    }
    return eqvIO(
      array.reduce(ios, succeedWith(42), (l, r) => l.parApplyFirst(r)),
      succeedWith(42)
    );
  });
  describe("#bracketExit", function() {
    this.timeout(10000);
    // Verify that bracketExit has the cleanup semantics that we expect
    // We produce an acquisition and release that wait for a random time and then increment/decrement a ref
    // We also have a use that waits some time then succeeds or fails randomly
    // Finally, we interrupt this thread after some random delay
    // In all cases the value of the resuling ref should be 0 because of cleanup
    it("finalizer should execute in all cases", () =>
      fc.assert(
        fc.asyncProperty(
          fc.nat(30),
          fc.nat(30),
          fc.nat(30),
          fc.nat(90),
          arbEitherIO(fc.string(), fc.nat()),
          (acqDelay, useDelay, relDelay, interruptDelay, useResult) =>
            expectExit(
              makeRef()(0)
              .chain((cell) => {
                const action = (cell.update((n) => n + 1).delay(acqDelay)).widenError<string>()
                  .bracket((_) => cell.update((n) => n - 1).delay(relDelay), (_) => useResult.delay(useDelay));
                return action.fork()
                  .chain((child) => child.interrupt.delay(interruptDelay).applySecond(cell.get));
              }),
              done(0)
            )
        )
      )
    );
  });
});
