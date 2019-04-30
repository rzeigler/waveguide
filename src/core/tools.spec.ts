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
import { Arbitrary, constantFrom, nat, tuple } from "fast-check";
import { Exit, IO, Step, Initial, io, Value } from "./io";

export function adaptMocha<E, A>(io: IO<E, A>, expected: Exit<E, A>, done: (a?: any) => void) {
  io.unsafeRun((result) => {
    try {
      expect(result).to.deep.equal(expected);
      done();
    } catch (e) {
      done(e);
    }
  });
}

export function adaptFastCheckProperty<E, A>(io1: IO<E, A>, io2: IO<E, A>): Promise<boolean> {
  return Promise.resolve(false);
}

export const arbitraryVariantIO: Arbitrary<Initial<unknown, unknown>["_tag"]> =
  constantFrom("succeed", "complete", "suspend", "async");

export function arbitraryIO<A>(arb: Arbitrary<A>): Arbitrary<IO<never, A>> {
  return arbitraryVariantIO
    .chain((ioStep) => {
      if (ioStep === "succeed") {
        return arb.map((a) => io.succeed(a));
      } else if (ioStep === "complete") {
        return arb.map((a) => io.completeWith(new Value(a)));
      } else if (ioStep === "suspend") {
        // We now need to do recursion... wooo
        return arbitraryIO(arb)
          .map((nestedIO) => io.suspend(() => nestedIO));
      } else { // async with random delay
        return tuple(nat(), arb)
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

// export const functor = {
//   identity: <F, A>(F: Functor<F>, S: Setoid<HKT<F, A>>) => (fa: HKT<F, A>): boolean => {
//     return S.equals(F.map(fa, a => a), fa)
//   },
//   composition: <F, A, B, C>(F: Functor<F>, S: Setoid<HKT<F, C>>, ab: Function1<A, B>, bc: Function1<B, C>) => (
//     fa: HKT<F, A>
//   ): boolean => {
//     return S.equals(F.map(fa, a => bc(ab(a))), F.map(F.map(fa, ab), bc))
//   }
// }

// export const apply = {
//   associativeComposition: <F, A, B, C>(F: Apply<F>, S: Setoid<HKT<F, C>>) => (
//     fa: HKT<F, A>,
//     fab: HKT<F, Function1<A, B>>,
//     fbc: HKT<F, Function1<B, C>>
//   ): boolean => {
//     return S.equals(
//       F.ap(F.ap(F.map(fbc, bc => (ab: Function1<A, B>) => (a: A) => bc(ab(a))), fab), fa),
//       F.ap(fbc, F.ap(fab, fa))
//     )
//   }
// }

// export const applicative = {
//   identity: <F, A>(F: Applicative<F>, S: Setoid<HKT<F, A>>) => (fa: HKT<F, A>): boolean => {
//     return S.equals(F.ap(F.of((a: A) => a), fa), fa)
//   },
//   homomorphism: <F, A, B>(F: Applicative<F>, S: Setoid<HKT<F, B>>, ab: Function1<A, B>) => (a: A): boolean => {
//     return S.equals(F.ap(F.of(ab), F.of(a)), F.of(ab(a)))
//   },
//   interchange: <F, A, B>(F: Applicative<F>, S: Setoid<HKT<F, B>>) => (a: A, fab: HKT<F, Function1<A, B>>): boolean => {
//     return S.equals(F.ap(fab, F.of(a)), F.ap(F.of((ab: Function1<A, B>) => ab(a)), fab))
//   },
//   derivedMap: <F, A, B>(F: Applicative<F>, S: Setoid<HKT<F, B>>, ab: Function1<A, B>) => (fa: HKT<F, A>): boolean => {
//     return S.equals(F.map(fa, ab), F.ap(F.of(ab), fa))
//   }
// }

// export const chain = {
//   associativity: <F, A, B, C>(
//     F: Chain<F>,
//     S: Setoid<HKT<F, C>>,
//     afb: Function1<A, HKT<F, B>>,
//     bfc: Function1<B, HKT<F, C>>
//   ) => (fa: HKT<F, A>): boolean => {
//     return S.equals(F.chain(F.chain(fa, afb), bfc), F.chain(fa, a => F.chain(afb(a), bfc)))
//   },
//   derivedAp: <F, A, B>(F: Chain<F>, S: Setoid<HKT<F, B>>, fab: HKT<F, Function1<A, B>>) => (fa: HKT<F, A>): boolean => {
//     return S.equals(F.ap(fab, fa), F.chain(fab, f => F.map(fa, f)))
//   }
// }

// export const monad = {
//   leftIdentity: <M, A, B>(M: Monad<M>, S: Setoid<HKT<M, B>>, afb: Function1<A, HKT<M, B>>) => (a: A): boolean => {
//     return S.equals(M.chain(M.of(a), afb), afb(a))
//   },
//   rightIdentity: <M, A>(M: Monad<M>, S: Setoid<HKT<M, A>>) => (fa: HKT<M, A>): boolean => {
//     return S.equals(M.chain(fa, M.of), fa)
//   },
//   derivedMap: <M, A, B>(M: Monad<M>, S: Setoid<HKT<M, B>>, ab: Function1<A, B>) => (fa: HKT<M, A>): boolean => {
//     return S.equals(M.map(fa, ab), M.chain(fa, a => M.of(ab(a))))
//   }
// }
