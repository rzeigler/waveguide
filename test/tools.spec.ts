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

// Tools for performing tests against IO with mocha

import { expect } from "chai";
import fc, { Arbitrary } from "fast-check";
import { Eq } from "fp-ts/lib/Eq";
import { constTrue, identity } from "fp-ts/lib/function";
import { Exit, Value } from "../src/exit";
import { abort, asyncTotal, completeWith, fail, IO, io, succeed, suspend, unit } from "../src/io";
import { Fn1 } from "../src/support/types";

/**
 * @deprecated use eqvIO instead
 */
export function expectExit<E, A>(ioa: IO<E, A>, expected: Exit<E, A>): Promise<void> {
  return expectExitIn(ioa, identity, expected);
}

export function expectExitIn<E, A, B>(ioa: IO<E, A>, f: Fn1<Exit<E, A>, B>, expected: B): Promise<void> {
  return ioa.unsafeRunExitToPromise()
    .then((result) => {
      expect(f(result)).to.deep.equal(expected);
    });
}

export const assertEq = <A>(S: Eq<A>) => (a1: A) => (a2: A): IO<never, void> =>
  S.equals(a1, a2) ? unit : abort(`${a1} <> ${a2}`);

export function eqvIO<E, A>(io1: IO<E, A>, io2: IO<E, A>): Promise<boolean> {
  return io1.unsafeRunExitToPromise()
    .then((result1) =>
      io2.unsafeRunExitToPromise()
        .then((result2) => {
          return expect(result1).to.deep.equal(result2);
        })
        .then(constTrue)
    );
}

export function exitType<E, A>(io1: IO<E, A>, tag: Exit<E, A>["_tag"]): Promise<void> {
  return io1.unsafeRunExitToPromise()
    .then((result) => expect(result._tag).to.equal(tag))
    .then(() => undefined);
}

export const arbVariant: Arbitrary<string> =
  fc.constantFrom("succeed", "complete", "suspend", "async");

export function arbIO<E, A>(arb: Arbitrary<A>): Arbitrary<IO<E, A>> {
  return arbVariant
    .chain((ioStep) => {
      if (ioStep === "succeed") {
        return arb.map((a) => succeed(a));
      } else if (ioStep === "complete") {
        return arb.map((a) => completeWith(new Value(a)));
      } else if (ioStep === "suspend") {
        // We now need to do recursion... wooo
        return arbIO<E, A>(arb)
          .map((nestedIO) => suspend(() => nestedIO));
      } else { // async with random delay
        return fc.tuple(fc.nat(50), arb)
          .map(
            ([delay, val]) =>
              asyncTotal((callback) => {
                const handle = setTimeout(() => callback(val), delay);
                return () => {
                  clearTimeout(handle);
                };
            }));
      }
    });
}

export function arbConstIO<E, A>(a: A): Arbitrary<IO<E, A>> {
  return arbIO(fc.constant(a));
}

/**
 * Construct a Arbitrary of Kleisli IO A B given an arbitrary of A => B
 *
 * Used for testing Chain/Monad laws while ensuring we exercise asynchronous machinery
 * @param arb
 */
export function arbKleisliIO<E, A, B>(arbAB: Arbitrary<Fn1<A, B>>): Arbitrary<Fn1<A, IO<E, B>>> {
  return arbAB.chain((fab) =>
    arbIO<E, undefined>(fc.constant(undefined)) // construct an IO of arbitrary type we can push a result into
      .map((slot) =>
        (a: A) => slot.map((_) => fab(a))
      )
  );
}

export function arbErrorKleisliIO<E, E2, A>(arbEE: Arbitrary<Fn1<E, E2>>): Arbitrary<Fn1<E, IO<E2, A>>> {
  return arbKleisliIO<A, E, E2>(arbEE)
    .map((f) => (e: E) => f(e).flip());
}

/**
 * Given an Arbitrary<E> produce an Arbitrary<IO<E, A>> that fails with some evaluation model (sync, succeed, async...)
 * @param arbE
 */
export function arbErrorIO<E, A>(arbE: Arbitrary<E>): Arbitrary<IO<E, A>> {
  return arbE
    .chain((err) =>
      arbConstIO<E, undefined>(undefined)
        .map((iou) =>
          iou.chain((_) => fail(err))
        )
    );
}

/**
 * * Given an E produce an Arbitrary<IO<E, A>> that fails with some evaluation model (sync, succeed, async...)
 * @param e
 */
export function arbConstErrorIO<E, A>(e: E): Arbitrary<IO<E, A>> {
  return arbErrorIO(fc.constant(e));
}

export function arbEitherIO<E, A>(arbe: Arbitrary<E>, arba: Arbitrary<A>): Arbitrary<IO<E, A>> {
  return fc.boolean()
    .chain((error) => error ? arbErrorIO(arbe) : arbIO(arba));
}
