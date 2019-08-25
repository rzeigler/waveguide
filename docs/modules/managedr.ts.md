---
title: managedr.ts
nav_order: 6
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [ManagedR (type alias)](#managedr-type-alias)
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
- [encaseManaged (function)](#encasemanaged-function)
- [encaseWaveR (function)](#encasewaver-function)
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

# ManagedR (type alias)

**Signature**

```ts
export type ManagedR<R, E, A> = (r: R) => Managed<E, A>
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
export const instances: Monad3<URI> = ...
```

# ap (function)

Apply the function produced by resfab to the value produced by resa to produce a new resource.

**Signature**

```ts
export function ap<R, E, A, B>(ma: ManagedR<R, E, A>, mfab: ManagedR<R, E, FunctionN<[A], B>>): ManagedR<R, E, B> { ... }
```

# ap\_ (function)

Flipped version of ap

**Signature**

```ts
export function ap_<R, E, A, B>(mfab: ManagedR<R, E, FunctionN<[A], B>>, ma: ManagedR<R, E, A>): ManagedR<R, E, B> { ... }
```

# as (function)

Map a resource to a static value

This creates a resource of the provided constant b where the produced A has the same lifetime internally

**Signature**

```ts
export function as<R, E, A, B>(fa: ManagedR<R, E, A>, b: B): ManagedR<R, E, B> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<R, E, A>(acquire: WaveR<R, E, A>, release: FunctionN<[A], WaveR<R, E, unknown>>): ManagedR<R, E, A> { ... }
```

# chain (function)

**Signature**

```ts
export function chain<R, E, L, A>(left: ManagedR<R, E, L>, bind: FunctionN<[L], ManagedR<R, E, A>>): ManagedR<R, E, A> { ... }
```

# chainTap (function)

Construct a new 'hidden' resource using the produced A with a nested lifetime
Useful for performing initialization and cleanup that clients don't need to see

**Signature**

```ts
export function chainTap<R, E, A>(left: ManagedR<R, E, A>, bind: FunctionN<[A], ManagedR<R, E, unknown>>): ManagedR<R, E, A> { ... }
```

# chainTapWith (function)

Curried form of chainTap

**Signature**

```ts
export function chainTapWith<R, E, A>(bind: FunctionN<[A], ManagedR<R, E, unknown>>): FunctionN<[ManagedR<R, E, A>], ManagedR<R, E, A>> { ... }
```

# chainWith (function)

**Signature**

```ts
export function chainWith<R, E, L, A>(bind: FunctionN<[L], ManagedR<R, E, A>>): FunctionN<[ManagedR<R, E, L>], ManagedR<R, E, A>> { ... }
```

# consume (function)

Curried data last form of use

**Signature**

```ts
export function consume<R, E, A, B>(f: FunctionN<[A], WaveR<R, E, B>>): FunctionN<[ManagedR<R, E, A>], WaveR<R, E, B>> { ... }
```

# encaseManaged (function)

**Signature**

```ts
export function encaseManaged<E, A>(m: Managed<E, A>): ManagedR<{}, E, A> { ... }
```

# encaseWaveR (function)

**Signature**

```ts
export function encaseWaveR<R, E, A>(wave: WaveR<R, E, A>): ManagedR<R, E, A> { ... }
```

# getMonoid (function)

**Signature**

```ts
export function getMonoid<R, E, A>(Monoid: Monoid<A>): Monoid<ManagedR<R, E, A>> { ... }
```

# getSemigroup (function)

**Signature**

```ts
export function getSemigroup<R, E, A>(Semigroup: Semigroup<A>): Semigroup<ManagedR<R, E, A>> { ... }
```

# map (function)

**Signature**

```ts
export function map<R, E, L, A>(res: ManagedR<R, E, L>, f: FunctionN<[L], A>): ManagedR<R, E, A> { ... }
```

# mapWith (function)

**Signature**

```ts
export function mapWith<L, A>(f: FunctionN<[L], A>): <R, E>(res: ManagedR<R, E, L>) => ManagedR<R, E, A> { ... }
```

# provideTo (function)

**Signature**

```ts
export function provideTo<R, E, A, B>(ma: ManagedR<R, E, A>, wave: WaveR<A, E, B>): WaveR<R, E, B> { ... }
```

# pure (function)

**Signature**

```ts
export function pure<A>(value: A): ManagedR<{}, never, A> { ... }
```

# suspend (function)

**Signature**

```ts
export function suspend<R, E, A>(s: WaveR<R, E, ManagedR<R, E, A>>): ManagedR<R, E, A> { ... }
```

# to (function)

Curried form of as

**Signature**

```ts
export function to<B>(b: B): <R, E, A>(fa: ManagedR<R, E, A>) => ManagedR<R, E, B> { ... }
```

# use (function)

**Signature**

```ts
export function use<R, E, A, B>(ma: ManagedR<R, E, A>, f: FunctionN<[A], WaveR<R, E, B>>): WaveR<R, E, B> { ... }
```

# zip (function)

**Signature**

```ts
export function zip<R, E, A, B>(ma: ManagedR<R, E, A>, mb: ManagedR<R, E, B>): ManagedR<R, E, readonly [A, B]> { ... }
```

# zipWith (function)

**Signature**

```ts
export function zipWith<R, E, A, B, C>(ma: ManagedR<R, E, A>, mb: ManagedR<R, E, B>, f: FunctionN<[A, B], C>): ManagedR<R, E, C> { ... }
```
