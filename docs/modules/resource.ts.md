---
title: resource.ts
nav_order: 10
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Bracket (interface)](#bracket-interface)
- [Chain (interface)](#chain-interface)
- [Pure (interface)](#pure-interface)
- [Suspended (interface)](#suspended-interface)
- [Resource (type alias)](#resource-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [instances (constant)](#instances-constant)
- [ap (function)](#ap-function)
- [ap\_ (function)](#ap_-function)
- [bracket (function)](#bracket-function)
- [chain (function)](#chain-function)
- [consume (function)](#consume-function)
- [map (function)](#map-function)
- [pure (function)](#pure-function)
- [suspend (function)](#suspend-function)
- [use (function)](#use-function)
- [zip (function)](#zip-function)
- [zipWith (function)](#zipwith-function)

---

# Bracket (interface)

**Signature**

```ts
export interface Bracket<R, E, A> {
  readonly _tag: 'bracket'
  readonly acquire: RIO<R, E, A>
  readonly release: FunctionN<[A], RIO<R, E, unknown>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<R, E, L, A> {
  readonly _tag: 'chain'
  readonly left: Resource<R, E, L>
  readonly bind: FunctionN<[L], Resource<R, E, A>>
}
```

# Pure (interface)

**Signature**

```ts
export interface Pure<A> {
  readonly _tag: 'pure'
  readonly value: A
}
```

# Suspended (interface)

**Signature**

```ts
export interface Suspended<R, E, A> {
  readonly _tag: 'suspend'
  readonly suspended: RIO<R, E, Resource<R, E, A>>
}
```

# Resource (type alias)

A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.

This is a friendly monadic wrapper around bracketExit.

**Signature**

```ts
export type Resource<R, E, A> = Pure<A> | Bracket<R, E, A> | Suspended<R, E, A> | Chain<R, E, any, A>
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

**Signature**

```ts
export function ap<R, E, A, B>(resa: Resource<R, E, A>, resfab: Resource<R, E, FunctionN<[A], B>>): Resource<R, E, B> { ... }
```

# ap\_ (function)

**Signature**

```ts
export function ap_<R, E, A, B>(resfab: Resource<R, E, FunctionN<[A], B>>, resa: Resource<R, E, A>): Resource<R, E, B> { ... }
```

# bracket (function)

Create a resource from an acquisition and release function

**Signature**

```ts
export function bracket<R, E, A>(acquire: RIO<R, E, A>, release: FunctionN<[A], RIO<R, E, unknown>>): Bracket<R, E, A> { ... }
```

# chain (function)

Compose dependent resourcess.

The scope of left will enclose the scope of the resource produced by bind

**Signature**

```ts
export function chain<R, E, L, A>(left: Resource<R, E, L>, bind: FunctionN<[L], Resource<R, E, A>>): Chain<R, E, L, A> { ... }
```

# consume (function)

Curried data last form of use

**Signature**

```ts
export function consume<R, E, A, B>(f: FunctionN<[A], RIO<R, E, B>>): FunctionN<[Resource<R, E, A>], RIO<R, E, B>> { ... }
```

# map (function)

Map a resource

**Signature**

```ts
export function map<R, E, L, A>(res: Resource<R, E, L>, f: FunctionN<[L], A>): Resource<R, E, A> { ... }
```

# pure (function)

Lift a pure value into a resource

**Signature**

```ts
export function pure<A>(value: A): Pure<A> { ... }
```

# suspend (function)

Lift an IO of a Resource into a resource

**Signature**

```ts
export function suspend<R, E, A>(suspended: RIO<R, E, Resource<R, E, A>>): Suspended<R, E, A> { ... }
```

# use (function)

Use a resource to produce a program that can be run.s

**Signature**

```ts
export function use<R, E, A, B>(res: Resource<R, E, A>, f: FunctionN<[A], RIO<R, E, B>>): RIO<R, E, B> { ... }
```

# zip (function)

Zip two resources together as a tuple.

The scope of resa will enclose the scope of resb

**Signature**

```ts
export function zip<R, E, A, B>(resa: Resource<R, E, A>, resb: Resource<R, E, B>): Resource<R, E, readonly [A, B]> { ... }
```

# zipWith (function)

Zip two resources together with the given function.

The scope of resa will enclose the scope of resb

**Signature**

```ts
export function zipWith<R, E, A, B, C>(resa: Resource<R, E, A>,
    resb: Resource<R, E, B>,
    f: FunctionN<[A, B], C>): Resource<R, E, C> { ... }
```
