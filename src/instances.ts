// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Applicative2 } from "fp-ts/lib/Applicative";
import { Monad2 } from "fp-ts/lib/Monad";
import { Monoid } from "fp-ts/lib/Monoid";
import { Semigroup } from "fp-ts/lib/Semigroup";
import { IO } from "./io";

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
    empty: IO.never_() as unknown as IO<L, A>,
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
    empty: IO.pure(M.empty)
  };
}

/**
 * Get a monoid for IO<E, A> given a monoid for A that runs in sequence
 * @param M
 */
export function getParallelMonoid<L, A>(M: Monoid<A>): Monoid<IO<L, A>> {
  return {
    ...getParallelSemigroup(M),
    empty: IO.pure(M.empty)
  };
}
