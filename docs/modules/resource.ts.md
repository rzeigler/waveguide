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
export interface Bracket<E, A> {
  readonly _tag: 'bracket'
  readonly acquire: IO<E, A>
  readonly release: FunctionN<[A], IO<E, unknown>>
}
```

# Chain (interface)

**Signature**

```ts
export interface Chain<E, L, A> {
  readonly _tag: 'chain'
  readonly left: Resource<E, L>
  readonly bind: FunctionN<[L], Resource<E, A>>
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
export interface Suspended<E, A> {
  readonly _tag: 'suspend'
  readonly suspended: IO<E, Resource<E, A>>
}
```

# Resource (type alias)

A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.

This is a friendly monadic wrapper around bracketExit.

**Signature**

```ts
export type Resource<E, A> = Pure<A> | Bracket<E, A> | Suspended<E, A> | Chain<E, any, A>
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

**Signature**

```ts
export function ap<E, A, B>(resa: Resource<E, A>, resfab: Resource<E, FunctionN<[A], B>>): Resource<E, B> { ... }
```

# ap\_ (function)

**Signature**

```ts
export function ap_<E, A, B>(resfab: Resource<E, FunctionN<[A], B>>, resa: Resource<E, A>): Resource<E, B> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<E, A>(acquire: IO<E, A>, release: FunctionN<[A], IO<E, unknown>>): Bracket<E, A> { ... }
```

# chain (function)

**Signature**

```ts
export function chain<E, L, A>(left: Resource<E, L>, bind: FunctionN<[L], Resource<E, A>>): Chain<E, L, A> { ... }
```

# consume (function)

**Signature**

```ts
export function consume<E, A, B>(f: FunctionN<[A], IO<E, B>>): FunctionN<[Resource<E, A>], IO<E, B>> { ... }
```

# map (function)

**Signature**

```ts
export function map<E, L, A>(res: Resource<E, L>, f: FunctionN<[L], A>): Resource<E, A> { ... }
```

# pure (function)

**Signature**

```ts
export function pure<A>(value: A): Pure<A> { ... }
```

# suspend (function)

**Signature**

```ts
export function suspend<E, A>(suspended: IO<E, Resource<E, A>>): Suspended<E, A> { ... }
```

# use (function)

**Signature**

```ts
export function use<E, A, B>(res: Resource<E, A>, f: FunctionN<[A], IO<E, B>>): IO<E, B> { ... }
```

# zip (function)

**Signature**

```ts
export function zip<E, A, B>(resa: Resource<E, A>, resb: Resource<E, B>): Resource<E, readonly [A, B]> { ... }
```

# zipWith (function)

**Signature**

```ts
export function zipWith<E, A, B, C>(resa: Resource<E, A>,
    resb: Resource<E, B>,
    f: FunctionN<[A, B], C>): Resource<E, C> { ... }
```
