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
import { FunctionN, identity } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import {abort, done, interrupt, raise } from "../src/exit";
import { IO } from "../src/io";
import * as io from "../src/io";
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
import { string } from "fast-check";

// Tests for the io module
describe("io", () => {
    describe("#succeed", () => {
        it("should complete with a completed", () =>
            expectExit(io.pure(42), done(42))
        );
    });
    describe("#fail", () => {
        it("should complete with a failed", () =>
            expectExit(io.raiseError("boom"), raise("boom"))
        );
    });
    describe("#abort", () => {
        it("should complete with an aborted", () =>
            expectExit(io.raiseAbort("boom"), abort("boom"))
        );
    });
    describe("#interrupted", () => {
        it("should complete with an interrupted", () =>
            expectExit(io.raiseInterrupt, interrupt)
        );
    });
    describe("#exitWith", () => {
        it("should complete with a completed when provided", () =>
            expectExit(io.completed(done(42)), done(42))
        );
        it("should complete with a failed when provided", () =>
            expectExit(io.completed(raise("boom")), raise("boom"))
        );
        it("should complete with an aborted when provided", () =>
            expectExit(io.completed(abort("boom")), abort("boom"))
        );
        it("should complete with an interrupted when provided", () =>
            expectExit(io.completed(interrupt), interrupt)
        );
    });
    describe("#effect", () => {
        it("should complete at some a success", () =>
            expectExit(io.sync(() => 42), done(42))
        );
    });
    describe("#suspend", () => {
        it("should complete with synchronous effects", () =>
            expectExit(io.suspended(() => io.pure(42)), done(42))
        );
        it("should complete with asynchronous effects", () =>
            expectExit(io.suspended(() =>
                io.asyncTotal((callback) => {
                    const handle = setTimeout(() => callback(42), 0);
                    return () => { clearTimeout(handle); };
                })
            ), done(42))
        );
    });
    describe("#delay", () => {
        it("should complete with a success eventually", () =>
            expectExit(io.asyncTotal((callback) => {
                const handle = setTimeout(() => callback(42), 0);
                return () => { clearTimeout(handle); };
            }), done(42))
        );
    });
    describe("#async", () => {
        it("should complete with a success eventually", () =>
            expectExit(io.async((callback) => {
                const handle = setTimeout(() => callback(right(42)), 0);
                return () => { clearTimeout(handle); };
            }), done(42))
        );
        it("should complete with a failed eventually", () =>
            expectExit(io.async((callback) => {
                const handle = setTimeout(() => callback(left("boom")), 0);
                return () => { clearTimeout(handle); };
            }), raise("boom"))
        );
    });
    describe("#interrupted", () => {
        it("should complete with interrupted", () =>
            expectExit(io.raiseInterrupt, interrupt)
        );
    });
    describe("#run", () => {
        it("should complete with an expected completion", () =>
            expectExit(io.result(io.pure(42)), done(done(42)))
        );
        it("should complete with an expected failure", () =>
            expectExit(io.result(io.raiseError("boom")), done(raise("boom")))
        );
        it("should complete with an expected abort", () =>
            expectExit(io.result(io.raiseAbort("boom")), done(abort("boom")))
        );
        /**
     * This may be counter-intruitive, but the interrupted io sets the interrupted flag.
     * Additionally, because of how the driver operates, there is always a at least 1 more action following leaving an
     * uninterruptible region
     * Therefore it is never possible to fully complete a fiber that has been interrupted and we don't get a 'value' as
     * above
     */
        it("should complete with an expected interrupt", () =>
            expectExit(io.uninterruptible(io.result(io.raiseInterrupt)), interrupt)
        );
    });
    describe("raceFirst", () => {
        it("should resolve with the first success", () =>
            expectExit(io.raceFirst(io.delay(io.pure(42), 10), io.never), done(42))
        );
        it("should resolve with the first success (flipped)", () =>
            expectExit(io.raceFirst(io.never, io.delay(io.pure(42), 10)), done(42))
        );
        it("should resolve with the first error", () =>
            expectExit(io.raceFirst(io.delay(io.raiseError("boom"), 10), io.never), raise("boom"))
        );
        it("should resolve with the first error (flipped)", () =>
            expectExit(io.raceFirst(io.never, io.delay(io.raiseError("boom"), 10)), raise("boom"))
        );
    });
    describe("race", () => {
        it("should resolve wih a success", () =>
            expectExit(io.zip(
                io.race(io.delay(io.pure(42), 10), io.never),
                io.race(io.never, io.delay(io.pure(42), 14))
            ), done([42, 42]))
        );
        it("should resolve to a success on a failure", () =>
            expectExit(io.race(io.raiseError("boom!"), io.delay(io.pure(42), 10)), done(42))
        );
    });
    describe("interruptible state", () => {
        it("should set interrupt status", () =>
            expectExit(
                io.interruptible(io.accessInterruptible),
                done(true)
            )
        );
        it("should set nested interrupt status", () =>
            expectExit(
                io.uninterruptible(io.interruptible(io.accessInterruptible)),
                done(true)
            )
        );
        it("should compose", () =>
            expectExit(
                io.uninterruptible(io.interruptible(io.uninterruptible(io.accessInterruptible))),
                done(false)
            )
        );
        it("should allow setting uninterruptible", () =>
            expectExit(
                io.uninterruptible(io.accessInterruptible),
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
            identity: <E, A>(ioa: IO<E, A>) => eqvIO(io.map(ioa, identity), ioa),
            composition: <E, A, B, C>(ioa: IO<E, A>, fab: FunctionN<[A], B>, fbc: FunctionN<[B], C>) =>
                eqvIO(pipe(ioa, io.lift(fab), io.lift(fbc)), io.map(ioa, (a) => fbc(fab(a))))
        };

        const apply = {
            associativeComposition: <E, A, B, C>(ioa: IO<E, A>,
                iofab: IO<E, FunctionN<[A], B>>,
                iofbc: IO<E, FunctionN<[B], C>>) =>
                eqvIO(
                    io.ap_(
                        io.ap_(
                            io.map(iofbc,
                                (bc) => (ab: FunctionN<[A], B>) => (a: A) => bc(ab(a))
                            ),
                            iofab
                        ),
                        ioa
                    ),
                    io.ap_(iofbc, io.ap_(iofab, ioa))
                )
        };

        const applicative = {
            identity: <E, A>(ioa: IO<E, A>) =>
                eqvIO(
                    io.ap(ioa, io.pure(identity)),
                    ioa
                ),
            homomorphism: <A, B>(fab: FunctionN<[A], B>, a: A) =>
                eqvIO(
                    io.ap_(io.pure(fab), io.pure(a)),
                    io.pure(fab(a))
                ),
            interchange: <E, A, B>(a: A, iofab: IO<E, FunctionN<[A], B>>) =>
                eqvIO(
                    io.ap_(iofab, io.pure(a)),
                    io.ap_(io.pure((ab: FunctionN<[A], B>) => ab(a)), iofab)
                ),
            derivedMap: <E, A, B>(ab: FunctionN<[A], B>, ioa: IO<E, A>) =>
                eqvIO(
                    io.map(ioa, ab),
                    io.ap_(io.pure(ab), ioa)
                )
        };

        const chain = {
            associativivity: <E, A, B, C>(ioa: IO<E, A>, kab: FunctionN<[A], IO<E, B>>, kbc: FunctionN<[B], IO<E, C>>) =>
                eqvIO(
                    pipe(
                        ioa,
                        io.chainWith(kab),
                        io.chainWith(kbc)
                    ),
                    io.chain(ioa, (a) => io.chain(kab(a), kbc))
                ),
            derivedAp: <E, A, B>(iofab: IO<E, FunctionN<[A], B>>, ioa: IO<E, A>) =>
                eqvIO(
                    io.ap(ioa, iofab),
                    io.chain(iofab, (f) => io.map(ioa, f))
                )
        };

        const monad = {
            leftIdentity: <E, A, B>(kab: FunctionN<[A], IO<E, B>>, a: A) =>
                eqvIO(
                    io.chain(io.pure(a), kab),
                    kab(a)
                ),
            rightIdentity: <E, A>(ioa: IO<E, A>) =>
                eqvIO(
                    io.chain(ioa, io.pure),
                    ioa
                ),
            derivedMap: <E, A, B>(ab: FunctionN<[A], B>, ioa: IO<E, A>) =>
                eqvIO(
                    io.map(ioa, ab),
                    io.chain(ioa, (a) => io.pure(ab(a)))
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
                        fc.constant(strlen).map(io.pure),
                        fc.constant(even).map(io.pure),
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
                        fc.constant(strlen).map(io.pure),
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
                        io.chain(host, (_) => io.chainError(io.raiseError(e), kea)),
                        io.chain(host, (_) => kea(e))
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
                    fc.array(arbIO<string, number>(fc.integer())),
                    arbErrorIO<string, number>(fc.constant("failure")),
                    fc.array(arbIO<string, number>(fc.integer())),
                    (before, err, after) => {
                        const arr = [...before, err, ...after]
                        const result = array.sequence(io.instances)(arr)
                        return eqvIO(result, io.as(err, [] as number[]));
                    }
                )
            )
        );
    });
    it("many async ios should be parZipWithAble", () => {
        const ios: IO<never, number>[] = [];
        for (let i = 0; i < 10000; i++) {
            ios.push(io.delay(io.pure(1), Math.random() * 100));
        }
        return eqvIO(
            array.reduce(ios, io.pure(42) as IO<never, number>, (l, r) => io.parApplyFirst(l, r)),
            io.pure(42)
        );
    });
    it("many sync ios should be parZipWithAble", () => {
        const ios: IO<never, number>[] = [];
        for (let i = 0; i < 10000; i++) {
            ios.push(io.pure(1));
        }
        return eqvIO(
            array.reduce(ios, io.pure(42) as IO<never, number>, (l, r) => io.parApplyFirst(l, r)),
            io.pure(42)
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
                            io.chain(makeRef()(0),
                                (cell) => {
                                    const action = io.bracket(
                                        io.delay(cell.update((n) => n + 1), acqDelay),
                                        (_) => io.delay(cell.update((n) => n - 1), relDelay), (_) => io.delay(useResult, useDelay));
                                    return io.chain(io.fork(action),
                                        (child) => io.applySecond(io.delay(child.interrupt, interruptDelay), cell.get));
                                }),
                            done(0)
                        )
                )
            )
        );
    });
});
