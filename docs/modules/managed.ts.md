---
title: managed.ts
nav_order: 5
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Bracket (interface)](#bracket-interface)
- [Chain (interface)](#chain-interface)
- [Encase (interface)](#encase-interface)
- [Pure (interface)](#pure-interface)
- [Suspended (interface)](#suspended-interface)
- [Managed (type alias)](#managed-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [instances (constant)](#instances-constant)
- [ap (function)](#ap-function)
- [ap\_ (function)](#ap_-function)
- [as (function)](#as-function)
- [bracket (function)](#bracket-function)
- [chain (function)](#chain-function)
- [chainTap (function)](#chaintap-function)
- [chainTapWith (function)](#chaintapwith-function)
- [chainWith (function)](#chainwith-function)
- [consume (function)](#consume-function)
- [encaseWave (function)](#encasewave-function)
- [fiber (function)](#fiber-function)
- [getMonoid (function)](#getmonoid-function)
- [getSemigroup (function)](#getsemigroup-function)
- [map (function)](#map-function)
- [mapWith (function)](#mapwith-function)
- [provideTo (function)](#provideto-function)
- [pure (function)](#pure-function)
- [suspend (function)](#suspend-function)
- [to (function)](#to-function)
- [use (function)](#use-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# Bracket (interface)

**Signature**

```ts
export interface Bracket<E, A> {
  readonly _tag: ManagedTag.Bracket
  readonly acquire: Wave<E, A>
  readonly release: FunctionN<[A], Wave<E, unknown>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<E, L, A> {
  readonly _tag: ManagedTag.Chain
  readonly left: Managed<E, L>
  readonly bind: FunctionN<[L], Managed<E, A>>
}
```

# Encase (interface)

**Signature**

```ts
export interface Encase<E, A> {
  readonly _tag: ManagedTag.Encase
  readonly acquire: Wave<E, A>
}
```

# Pure (interface)

**Signature**

```ts
export interface Pure<E, A> {
  readonly _tag: ManagedTag.Pure
  readonly value: A
}
```

# Suspended (interface)

**Signature**

```ts
export interface Suspended<E, A> {
  readonly _tag: ManagedTag.Suspended
  readonly suspended: Wave<E, Managed<E, A>>
}
```

# Managed (type alias)

A Managed<E, A> is a type that encapsulates the safe acquisition and release of a resource.

This is a friendly monadic wrapper around bracketExit.

**Signature**

```ts
export type Managed<E, A> = Pure<E, A> | Encase<E, A> | Bracket<E, A> | Suspended<E, A> | Chain<E, any, A>
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# instances (constant)

**Signature**

```ts
export const instances: Monad2<URI> = ...
```

# ap (function)

Apply the function produced by resfab to the value produced by resa to produce a new resource.

**Signature**

```ts
export function ap<E, A, B>(resa: Managed<E, A>, resfab: Managed<E, FunctionN<[A], B>>): Managed<E, B> { ... }
```

# ap\_ (function)

Flipped version of ap

**Signature**

```ts
export function ap_<E, A, B>(resfab: Managed<E, FunctionN<[A], B>>, resa: Managed<E, A>): Managed<E, B> { ... }
```

# as (function)

Map a resource to a static value

This creates a resource of the provided constant b where the produced A has the same lifetime internally

**Signature**

```ts
export function as<E, A, B>(fa: Managed<E, A>, b: B): Managed<E, B> { ... }
```

# bracket (function)

Create a resource from an acquisition and release function

**Signature**

```ts
export function bracket<E, A>(acquire: Wave<E, A>, release: FunctionN<[A], Wave<E, unknown>>): Managed<E, A> { ... }
```

# chain (function)

Compose dependent resourcess.

The scope of left will enclose the scope of the resource produced by bind

**Signature**

```ts
export function chain<E, L, A>(left: Managed<E, L>, bind: FunctionN<[L], Managed<E, A>>): Managed<E, A> { ... }
```

# chainTap (function)

Construct a new 'hidden' resource using the produced A with a nested lifetime
Useful for performing initialization and cleanup that clients don't need to see

**Signature**

```ts
export function chainTap<E, A>(left: Managed<E, A>, bind: FunctionN<[A], Managed<E, unknown>>): Managed<E, A> { ... }
```

# chainTapWith (function)

Curried form of chainTap

**Signature**

```ts
export function chainTapWith<E, A>(bind: FunctionN<[A], Managed<E, unknown>>): FunctionN<[Managed<E, A>], Managed<E, A>> { ... }
```

# chainWith (function)

Curried form of chain

**Signature**

```ts
export function chainWith<E, L, A>(bind: FunctionN<[L], Managed<E, A>>): FunctionN<[Managed<E, L>], Managed<E, A>> { ... }
```

# consume (function)

Curried data last form of use

**Signature**

```ts
export function consume<E, A, B>(f: FunctionN<[A], Wave<E, B>>): FunctionN<[Managed<E, A>], Wave<E, B>> { ... }
```

# encaseWave (function)

Create a Resource by wrapping an IO producing a value that does not need to be disposed

**Signature**

```ts
export function encaseWave<E, A>(rio: Wave<E, A>): Managed<E, A> { ... }
```

# fiber (function)

Create a Resource from the fiber of an IO.
The acquisition of this resource corresponds to forking rio into a fiber.
The destruction of the resource is interrupting said fiber.

**Signature**

```ts
export function fiber<E, A>(rio: Wave<E, A>): Managed<never, Fiber<E, A>> { ... }
```

# getMonoid (function)

**Signature**

```ts
export function getMonoid<E, A>(Monoid: Monoid<A>): Monoid<Managed<E, A>> { ... }
```

# getSemigroup (function)

**Signature**

```ts
export function getSemigroup<E, A>(Semigroup: Semigroup<A>): Semigroup<Managed<E, A>> { ... }
```

# map (function)

Map a resource

**Signature**

```ts
export function map<E, L, A>(res: Managed<E, L>, f: FunctionN<[L], A>): Managed<E, A> { ... }
```

# mapWith (function)

Curried form of mapWith

**Signature**

```ts
export function mapWith<L, A>(f: FunctionN<[L], A>): <E>(res: Managed<E, L>) => Managed<E, A> { ... }
```

# provideTo (function)

Use a resource to provide the environment to a WaveR

**Signature**

```ts
export function provideTo<R, E, A>(man: Managed<E, R>, wave: WaveR<R, E, A>): Wave<E, A> { ... }
```

# pure (function)

Lift a pure value into a resource

**Signature**

```ts
export function pure<A>(value: A): Managed<never, A> { ... }
```

# suspend (function)

Lift an IO of a Resource into a resource

**Signature**

```ts
export function suspend<E, A>(suspended: Wave<E, Managed<E, A>>): Managed<E, A> { ... }
```

# to (function)

Curried form of as

**Signature**

```ts
export function to<B>(b: B): <E, A>(fa: Managed<E, A>) => Managed<E, B> { ... }
```

# use (function)

Use a resource to produce a program that can be run.s

**Signature**

```ts
export function use<E, A, B>(res: Managed<E, A>, f: FunctionN<[A], Wave<E, B>>): Wave<E, B> { ... }
```

# zip (function)

Zip two resources together as a tuple.

The scope of resa will enclose the scope of resb

**Signature**

```ts
export function zip<E, A, B>(resa: Managed<E, A>, resb: Managed<E, B>): Managed<E, readonly [A, B]> { ... }
```

# zipWith (function)

Zip two resources together with the given function.

The scope of resa will enclose the scope of resb

**Signature**

```ts
export function zipWith<E, A, B, C>(resa: Managed<E, A>,
    resb: Managed<E, B>,
    f: FunctionN<[A, B], C>): Managed<E, C> { ... }
```
