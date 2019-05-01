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
import { constTrue, Function1 } from "fp-ts/lib/function";
import { Exit, Value } from "./exit";
import { IO, io } from "./io";

export function adaptMocha<E, A>(ioa: IO<E, A>, expected: Exit<E, A>, done: (a?: any) => void) {
  ioa.unsafeRun((result) => {
    try {
      expect(result).to.deep.equal(expected);
      done();
    } catch (e) {
      done(e);
    }
  });
}

export function eqvIO<E, A>(io1: IO<E, A>, io2: IO<E, A>): Promise<boolean> {
  // TODO: Use additional machinery rather than promises
  return io1.unsafeRunToPromiseTotal()
    .then((result1) =>
      io2.unsafeRunToPromiseTotal()
        .then((result2) => expect(result1).to.deep.equal(result2))
        .then(constTrue)
    );
}

export const arbVariant: Arbitrary<string> =
  fc.constantFrom("succeed", "complete", "suspend", "async");

export function arbIO<A>(arb: Arbitrary<A>): Arbitrary<IO<never, A>> {
  return arbVariant
    .chain((ioStep) => {
      if (ioStep === "succeed") {
        return arb.map((a) => io.succeed(a));
      } else if (ioStep === "complete") {
        return arb.map((a) => io.completeWith(new Value(a)));
      } else if (ioStep === "suspend") {
        // We now need to do recursion... wooo
        return arbIO(arb)
          .map((nestedIO) => io.suspend(() => nestedIO));
      } else { // async with random delay
        return fc.tuple(fc.nat(50), arb)
          .map(
            ([delay, val]) =>
              io.delay((callback) => {
                const handle = setTimeout(() => callback(val), delay);
                return () => {
                  clearTimeout(handle);
                };
            }));
      }
    });
}

/**
 * Construct a Arbitrary of Kleisli IO A B given an arbitrary of A => B
 *
 * Used for testing Chain/Monad laws while ensuring we exercise asynchronous machinery
 * @param arb
 */
export function arbKleisliIO<E, A, B>(arbAB: Arbitrary<Function1<A, B>>): Arbitrary<Function1<A, IO<E, B>>> {
  return arbAB.chain((fab) =>
    arbIO(fc.constant(undefined)) // construct an IO of arbitrary type we can push a result into
      .map((slot) =>
        (a: A) => slot.map((_) => fab(a))
      )
  );
}
