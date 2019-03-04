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

import { IO, OneOf } from "waveguide";
export { IO } from "waveguide";
import { Applicative2 } from "fp-ts/lib/Applicative";
import { Monad2 } from "fp-ts/lib/Monad";
import { Monoid } from "fp-ts/lib/Monoid";
import { Semigroup } from "fp-ts/lib/Semigroup";

export const URI = "IO";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    IO: IO<L, A>;
  }
}

const map = <L, A, B>(fa: IO<L, A>, f: (a: A) => B): IO<L, B> => fa.map(f);

const of = <L, A>(a: A): IO<L, A> => IO.pure(a);

/**
 * Get the Monad instance for an IO<E, A>
 */
export const monad: Monad2<URI> = {
  URI,
  map,
  of,
  ap: <L, A, B>(fab: IO<L, (a: A) => B>, fa: IO<L, A>): IO<L, B> => fab.ap_(fa),
  chain: <L, A, B>(fa: IO<L, A>, f: (a: A) => IO<L, B>): IO<L, B> => fa.chain(f)
};

/**
 * Get a parallel applicative instance for IO<E, A>
 */
export const parallelApplicative: Applicative2<URI> = {
  URI,
  map,
  of,
  ap: <L, A, B>(fab: IO<L, (a: A) => B>, fa: IO<L, A>): IO<L, B> => fab.parAp_(fa)
};

/**
 * Get a monoid for IO<E, A> that combines actions by racing them.
 */
export function getRaceMonoid<L, A>(): Monoid<IO<L, A>> {
  return {
    empty: IO.never_(),
    concat: (l: IO<L, A>, r: IO<L, A>): IO<L, A> => l.race(r)
  };
}

/**
 * Get a semigroup for IO<E, A> given a semigroup for A.
 * @param S
 */
export function getSemigroup<L, A>(S: Semigroup<A>): Semigroup<IO<L, A>> {
  return {
    concat: (l: IO<L, A>, r: IO<L, A>): IO<L, A> => l.map2(r, S.concat)
  };
}

/**
 * Get a semigroup for IO<E, A> given a semigroup for A that runs in parallel
 * @param S
 */
export function getParallelSemigroup<L, A>(S: Semigroup<A>): Semigroup<IO<L, A>> {
  return {
    concat: (l: IO<L, A>, r: IO<L, A>): IO<L, A> => l.parMap2(r, S.concat)
  };
}

/**
 * Get a monoid for IO<E, A> given a monoid for A that runs in sequence
 * @param M
 */
export function getMonoid<L, A>(M: Monoid<A>): Monoid<IO<L, A>> {
  return {
    ...getSemigroup(M),
    empty: IO.of(M.empty)
  };
}

/**
 * Get a monoid for IO<E, A> given a monoid for A that runs in sequence
 * @param M
 */
export function getParallelMonoid<L, A>(M: Monoid<A>): Monoid<IO<L, A>> {
  return {
    ...getParallelSemigroup(M),
    empty: IO.of(M.empty)
  };
}

import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable, Option } from "fp-ts/lib/Option";

/**
 * fromNullable lifted over the IO type
 * @param io
 */
export function optionally<E, A>(io: IO<E, A | null | undefined>): IO<E, Option<A>> {
  return io.map(fromNullable);
}

/**
 * Convert a OneOf into an Either.
 *
 * First -> Left, Second -> Right.
 * @param oneOf
 */
export function fromOneOf<E, A>(oneOf: OneOf<E, A>): Either<E, A> {
  if (oneOf._tag === "first") {
    return left(oneOf.first);
  }
  return right(oneOf.second);
}
