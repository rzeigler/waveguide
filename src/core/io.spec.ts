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
import { compose, Function1, identity } from "fp-ts/lib/function";
import { ref } from "../concurrent/ref";
import { Aborted, Failed, Interrupted, Value } from "./exit";
import { io, IO } from "./io";
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
      expectExit(io.succeed(42), new Value(42))
    );
  });
  describe("#fail", () => {
    it("should complete with a failed", () =>
      expectExit(io.fail("boom"), new Failed("boom"))
    );
  });
  describe("#abort", () => {
    it("should complete with an aborted", () =>
      expectExit(io.abort("boom"), new Aborted("boom"))
    );
  });
  describe("#interrupted", () => {
    it("should complete with an interrupted", () =>
      expectExit(io.interrupted, new Interrupted())
    );
  });
  describe("#exitWith", () => {
    it("should complete with a completed when provided", () =>
      expectExit(io.completeWith(new Value(42)), new Value(42))
    );
    it("should complete with a failed when provided", () =>
      expectExit(io.completeWith(new Failed("boom")), new Failed("boom"))
    );
    it("should complete with an aborted when provided", () =>
      expectExit(io.completeWith(new Aborted("boom")), new Aborted("boom"))
    );
    it("should complete with an interrupted when provided", () =>
      expectExit(io.completeWith(new Interrupted()), new Interrupted())
    );
  });
  describe("#effect", () => {
    it("should complete at some a success", () =>
      expectExit(io.effect(() => 42), new Value(42))
    );
  });
  describe("#suspend", () => {
    it("should complete with synchronous effects", () =>
      expectExit(io.suspend(() => io.succeed(42)), new Value(42))
    );
    it("should complete with asynchronous effects", () =>
      expectExit(io.suspend(() =>
        io.asyncTotal((callback) => {
          const handle = setTimeout(() => callback(42), 0);
          return () => { clearTimeout(handle); };
        })
      ), new Value(42))
    );
  });
  describe("#delay", () => {
    it("should complete with a success eventually", () =>
      expectExit(io.asyncTotal((callback) => {
        const handle = setTimeout(() => callback(42), 0);
        return () => { clearTimeout(handle); };
      }), new Value(42))
    );
  });
  describe("#async", () => {
    it("should complete with a success eventually", () =>
      expectExit(io.async((callback) => {
        const handle = setTimeout(() => callback(right(42)), 0);
        return () => { clearTimeout(handle); };
      }), new Value(42))
    );
    it("should complete with a failed eventually", () =>
      expectExit(io.async((callback) => {
        const handle = setTimeout(() => callback(left("boom")), 0);
        return () => { clearTimeout(handle); };
      }), new Failed("boom"))
    );
  });
  describe("#interrupted", () => {
    it("should complete with interrupted", () =>
      expectExit(io.interrupted, new Interrupted())
    );
  });

  describe("#bracketExit", () => {
    describe("properties", function() {
      this.timeout(5000);
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
                ref.alloc(0)
                .chain((cell) => {
                  const action = (cell.update((n) => n + 1).delay(acqDelay)).widenError<string>()
                    .bracket((_) => cell.update((n) => n - 1).delay(relDelay), (_) => useResult.delay(useDelay));
                  return action.fork()
                    .chain((child) => child.interrupt.delay(interruptDelay).applySecond(cell.get));
                }),
                new Value(0)
              )
          )
        )
      );
    });
  });
});

// Tests for IO instances
describe("IO", () => {
  describe("#run", () => {
    it("should complete with an expected completion", () =>
      expectExit(io.succeed(42).run(), new Value(new Value(42)))
    );
    it("should complete with an expected failure", () =>
      expectExit(io.fail("boom").run(), new Value(new Failed("boom")))
    );
    it("should complete with an expected abort", () =>
      expectExit(io.abort("boom").run(), new Value(new Aborted("boom")))
    );
    // Interrupted is internal v external so we see interrupted inside the value rather than immediately propagating
    it("should complete with an expected interrupt", () =>
      expectExit(io.interrupted.run(), new Value(new Interrupted()))
    );
  });
  describe("interruptible state", () => {
    it("should set interrupt status", () =>
      expectExit(
        io.interruptible(io.getInterruptible),
        new Value(true)
      )
    );
    it("should set nested interrupt status", () =>
      expectExit(
        io.uninterruptible(io.interruptible(io.getInterruptible)),
        new Value(true)
      )
    );
    it("should compose", () =>
      expectExit(
        io.uninterruptible(io.interruptible(io.uninterruptible(io.getInterruptible))),
        new Value(false)
      )
    );
    it("should allow setting uninterruptible", () =>
      expectExit(
        io.uninterruptible(io.getInterruptible),
        new Value(false)
      )
    );
  });
  // Property test utils
  // base on fp-ts-laws at https://github.com/gcanti/fp-ts-laws but adapter for the fact that we need to run IOs
  describe("laws", function() {
    this.timeout(5000);
    const strlen: Function1<string, number> = (s: string) => s.length;
    const even: Function1<number, boolean> = (n: number) => n % 2 === 0;

    const functor = {
      identity: <E, A>(ioa: IO<E, A>) => eqvIO(ioa.map(identity), ioa),
      composition: <E, A, B, C>(ioa: IO<E, A>, fab: Function1<A, B>, fbc: Function1<B, C>) =>
        eqvIO(ioa.map(fab).map(fbc), ioa.map(compose(fbc, fab)))
    };

    const apply = {
      associativeComposition: <E, A, B, C>(ioa: IO<E, A>,
                                           iofab: IO<E, Function1<A, B>>,
                                           iofbc: IO<E, Function1<B, C>>) =>
        eqvIO(
          iofbc.map((bc) => (ab: Function1<A, B>) => (a: A) => bc(ab(a))).ap_(iofab).ap_(ioa),
          iofbc.ap_(iofab.ap_(ioa))
        )
    };

    const applicative = {
      identity: <E, A>(ioa: IO<E, A>) =>
        eqvIO(
          io.succeedC<E>()(identity).ap_(ioa),
          ioa
        ),
      homomorphism: <A, B>(fab: Function1<A, B>, a: A) =>
        eqvIO(
          io.succeed(fab).ap_(io.succeed(a)),
          io.succeed(fab(a))
        ),
      interchange: <E, A, B>(a: A, iofab: IO<E, Function1<A, B>>) =>
        eqvIO(
          iofab.ap_(io.succeed(a)),
          io.succeedC<E>()((ab: Function1<A, B>) => ab(a)).ap_(iofab)
        ),
      derivedMap: <E, A, B>(ab: Function1<A, B>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.map(ab),
          io.succeedC<E>()(ab).ap_(ioa)
        )
    };

    const chain = {
      associativivity: <E, A, B, C>(ioa: IO<E, A>, kab: Function1<A, IO<E, B>>, kbc: Function1<B, IO<E, C>>) =>
        eqvIO(
          ioa.chain(kab).chain(kbc),
          ioa.chain((a) => kab(a).chain(kbc))
        ),
      derivedAp: <E, A, B>(iofab: IO<E, Function1<A, B>>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.ap(iofab),
          iofab.chain((f) => ioa.map(f))
        )
    };

    const monad = {
      leftIdentity: <E, A, B>(kab: Function1<A, IO<E, B>>, a: A) =>
        eqvIO(
          io.succeedC<E>()(a).chain(kab),
          kab(a)
        ),
      rightIdentity: <E, A>(ioa: IO<E, A>) =>
        eqvIO(
          ioa.chain(io.succeed),
          ioa
        ),
      derivedMap: <E, A, B>(ab: Function1<A, B>, ioa: IO<E, A>) =>
        eqvIO(
          ioa.map(ab),
          ioa.chain((a) => io.succeed(ab(a)))
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
            fc.constant(strlen).map(io.succeed),
            fc.constant(even).map(io.succeed),
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
            fc.constant(strlen).map(io.succeed),
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
        recoveryEquivalence: <E, E2, A>(host: IO<E2, A>, e: E, kea: Function1<E, IO<E2, A>>) =>
          eqvIO(
           host.chain((_) => io.failC<A>()(e).chainError(kea)),
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
              array.sequence(io.monad)([...before, err, ...after]),
              err.as([])
            )
        )
      )
    );
  });
});
