import { IO } from "waveguide";
export { IO } from "waveguide";
import { Applicative2 } from "fp-ts/lib/Applicative";
import { Monad2 } from "fp-ts/lib/Monad";

export const URI = "IO";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    IO: IO<L, A>;
  }
}

const map = <L, A, B>(fa: IO<L, A>, f: (a: A) => B): IO<L, B> =>
  fa.map(f);

const of = <L, A>(a: A): IO<L, A> => IO.pure(a);

const ap = <L, A, B>(fab: IO<L, (a: A) => B>, fa: IO<L, A>): IO<L, B> => fab.ap_(fa);

const chain = <L, A, B>(fa: IO<L, A>, f: (a: A) => IO<L, B>): IO<L, B> => fa.chain(f);

export const monad: Monad2<URI> = {
  URI,
  map,
  of,
  ap,
  chain
};

const parAp = <L, A, B>(fab: IO<L, (a: A) => B>, fa: IO<L, A>): IO<L, B> => fab.parAp_(fa);

export const parApplicative: Applicative2<URI> = {
  URI,
  map,
  of,
  ap: parAp
};
