---
title: support/list.ts
nav_order: 15
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Cons (interface)](#cons-interface)
- [Nil (interface)](#nil-interface)
- [List (type alias)](#list-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [instances (constant)](#instances-constant)
- [isEmpty (constant)](#isempty-constant)
- [nil (constant)](#nil-constant)
- [nonEmpty (constant)](#nonempty-constant)
- [ap (function)](#ap-function)
- [cata (function)](#cata-function)
- [catac (function)](#catac-function)
- [chain (function)](#chain-function)
- [concat (function)](#concat-function)
- [cons (function)](#cons-function)
- [filter (function)](#filter-function)
- [filterc (function)](#filterc-function)
- [find (function)](#find-function)
- [findc (function)](#findc-function)
- [flatten (function)](#flatten-function)
- [foldl (function)](#foldl-function)
- [foldlc (function)](#foldlc-function)
- [foldr (function)](#foldr-function)
- [foldrc (function)](#foldrc-function)
- [fromArray (function)](#fromarray-function)
- [head (function)](#head-function)
- [isCons (function)](#iscons-function)
- [isNil (function)](#isnil-function)
- [last (function)](#last-function)
- [lift (function)](#lift-function)
- [map (function)](#map-function)
- [of (function)](#of-function)
- [reverse (function)](#reverse-function)
- [size (function)](#size-function)
- [snoc (function)](#snoc-function)
- [tail (function)](#tail-function)
- [toArray (function)](#toarray-function)

---

# Cons (interface)

**Signature**

```ts
export interface Cons<A> {
  readonly _tag: 'cons'
  readonly head: A
  readonly tail: List<A>
}
```

# Nil (interface)

**Signature**

```ts
export interface Nil {
  readonly _tag: 'nil'
}
```

# List (type alias)

**Signature**

```ts
export type List<A> = Cons<A> | Nil
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
export const instances: Monad1<URI> = ...
```

# isEmpty (constant)

**Signature**

```ts
export const isEmpty = ...
```

# nil (constant)

**Signature**

```ts
export const nil: List<never> = ...
```

# nonEmpty (constant)

**Signature**

```ts
export const nonEmpty = ...
```

# ap (function)

**Signature**

```ts
export function ap<A, B>(list: List<A>, fns: List<FunctionN<[A], B>>): List<B> { ... }
```

# cata (function)

**Signature**

```ts
export function cata<A, B>(list: List<A>, ifCons: FunctionN<[A, List<A>], B>, ifNil: Lazy<B>): B { ... }
```

# catac (function)

**Signature**

```ts
export function catac<A, B>(ifCons: FunctionN<[A, List<A>], B>, ifNil: Lazy<B>): FunctionN<[List<A>], B> { ... }
```

# chain (function)

**Signature**

```ts
export function chain<A, B>(list: List<A>, f: FunctionN<[A], List<B>>): List<B> { ... }
```

# concat (function)

**Signature**

```ts
export function concat<A>(front: List<A>, back: List<A>): List<A> { ... }
```

# cons (function)

**Signature**

```ts
export function cons<A>(h: A, t: List<A>): List<A> { ... }
```

# filter (function)

**Signature**

```ts
export function filter<A>(list: List<A>, f: Predicate<A>): List<A> { ... }
```

# filterc (function)

**Signature**

```ts
export function filterc<A>(f: Predicate<A>): FunctionN<[List<A>], List<A>> { ... }
```

# find (function)

**Signature**

```ts
export function find<A>(list: List<A>, f: Predicate<A>): Option<A> { ... }
```

# findc (function)

**Signature**

```ts
export function findc<A>(f: Predicate<A>): FunctionN<[List<A>], Option<A>> { ... }
```

# flatten (function)

**Signature**

```ts
export function flatten<A>(list: List<List<A>>): List<A> { ... }
```

# foldl (function)

**Signature**

```ts
export function foldl<A, B>(list: List<A>, b: B, f: FunctionN<[B, A], B>): B { ... }
```

# foldlc (function)

**Signature**

```ts
export function foldlc<A, B>(b: B, f: FunctionN<[B, A], B>): FunctionN<[List<A>], B> { ... }
```

# foldr (function)

**Signature**

```ts
export function foldr<A, B>(list: List<A>, b: B, f: FunctionN<[A, B], B>): B { ... }
```

# foldrc (function)

**Signature**

```ts
export function foldrc<A, B>(b: B, f: FunctionN<[A, B], B>): FunctionN<[List<A>], B> { ... }
```

# fromArray (function)

**Signature**

```ts
export function fromArray<A>(as: readonly A[]): List<A> { ... }
```

# head (function)

**Signature**

```ts
export function head<A>(list: List<A>): Option<A> { ... }
```

# isCons (function)

**Signature**

```ts
export function isCons<A>(list: List<A>): list is Cons<A> { ... }
```

# isNil (function)

**Signature**

```ts
export function isNil<A>(list: List<A>): list is Nil { ... }
```

# last (function)

**Signature**

```ts
export function last<A>(list: List<A>): Option<A> { ... }
```

# lift (function)

**Signature**

```ts
export function lift<A, B>(f: FunctionN<[A], B>): FunctionN<[List<A>], List<B>> { ... }
```

# map (function)

**Signature**

```ts
export function map<A, B>(list: List<A>, f: FunctionN<[A], B>): List<B> { ... }
```

# of (function)

**Signature**

```ts
export function of<A>(a: A): List<A> { ... }
```

# reverse (function)

**Signature**

```ts
export function reverse<A>(list: List<A>): List<A> { ... }
```

# size (function)

Get the size of a list.

This has pathologically bad performance.

**Signature**

```ts
export function size(list: List<unknown>): number { ... }
```

# snoc (function)

**Signature**

```ts
export function snoc<A>(append: A, list: List<A>): List<A> { ... }
```

# tail (function)

**Signature**

```ts
export function tail<A>(list: List<A>): Option<List<A>> { ... }
```

# toArray (function)

**Signature**

```ts
export function toArray<A>(as: List<A>): A[] { ... }
```
