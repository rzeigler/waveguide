## waveguide-fp-ts

Instances for the following fp-ts typeclasses.

1) Monad -- `monad`
2) Applicative -- `parallelApplicative` uses `parAp` internally.
3) Monoid -- `getRaceMonoid<E, A>` combines `IO`s with racing semantics.
4) Semigroup - `getSemigroup<E, A>(S: Semigroup<A>)` 
5) Monoid -- `getMonoid<E, A>(M: Monoid<A>)`



See the [docs](./docs/README.md)
