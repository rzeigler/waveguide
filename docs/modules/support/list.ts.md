---
title: support/list.ts
nav_order: 31
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [List (type alias)](#list-type-alias)
- [Cons (class)](#cons-class)
  - [prepend (method)](#prepend-method)
  - [cata (method)](#cata-method)
  - [cataL (method)](#catal-method)
  - [head (method)](#head-method)
  - [tail (method)](#tail-method)
  - [foldl (method)](#foldl-method)
  - [reverse (method)](#reverse-method)
  - [drop (method)](#drop-method)
  - [init (method)](#init-method)
  - [last (method)](#last-method)
  - [filter (method)](#filter-method)
  - [find (method)](#find-method)
  - [isEmpty (method)](#isempty-method)
  - [size (method)](#size-method)
- [Nil (class)](#nil-class)
  - [prepend (method)](#prepend-method-1)
  - [cata (method)](#cata-method-1)
  - [cataL (method)](#catal-method-1)
  - [head (method)](#head-method-1)
  - [tail (method)](#tail-method-1)
  - [foldl (method)](#foldl-method-1)
  - [reverse (method)](#reverse-method-1)
  - [filter (method)](#filter-method-1)
  - [drop (method)](#drop-method-1)
  - [init (method)](#init-method-1)
  - [last (method)](#last-method-1)
  - [isEmpty (method)](#isempty-method-1)
  - [find (method)](#find-method-1)
  - [size (method)](#size-method-1)
- [list (constant)](#list-constant)

---

# List (type alias)

**Signature**

```ts
export type List<A> = Cons<A> | Nil<A>
```

# Cons (class)

**Signature**

```ts
export class Cons<A> {
  constructor(public readonly a: A, public readonly rest: List<A>) { ... }
  ...
}
```

## prepend (method)

**Signature**

```ts
public prepend(a: A): List<A> { ... }
```

## cata (method)

**Signature**

```ts
public cata<B>(ifNil: B, ifCons: Function2<A, List<A>, B>): B { ... }
```

## cataL (method)

**Signature**

```ts
public cataL<B>(ifNil: Lazy<B>, ifCons: Function2<A, List<A>, B>): B { ... }
```

## head (method)

**Signature**

```ts
public head(): Option<A> { ... }
```

## tail (method)

**Signature**

```ts
public tail(): Option<List<A>> { ... }
```

## foldl (method)

**Signature**

```ts
public foldl<B>(b: B, f: Function2<B, A, B>): B { ... }
```

## reverse (method)

**Signature**

```ts
public reverse(): List<A> { ... }
```

## drop (method)

**Signature**

```ts
public drop(n: number): List<A> { ... }
```

## init (method)

**Signature**

```ts
public init(): Option<List<A>> { ... }
```

## last (method)

**Signature**

```ts
public last(): Option<A> { ... }
```

## filter (method)

**Signature**

```ts
public filter(f: Predicate<A>): List<A> { ... }
```

## find (method)

**Signature**

```ts
public find(f: Predicate<A>): Option<A> { ... }
```

## isEmpty (method)

**Signature**

```ts
public isEmpty(): this is Nil<A> { ... }
```

## size (method)

**Signature**

```ts
public size(): number { ... }
```

# Nil (class)

**Signature**

```ts
export class Nil<A> { ... }
```

## prepend (method)

**Signature**

```ts
public prepend(a: A): List<A> { ... }
```

## cata (method)

**Signature**

```ts
public cata<B>(ifNil: B, ifCons: Function2<A, List<A>, B>): B { ... }
```

## cataL (method)

**Signature**

```ts
public cataL<B>(ifNil: Lazy<B>, ifCons: Function2<A, List<A>, B>): B { ... }
```

## head (method)

**Signature**

```ts
public head(): Option<A> { ... }
```

## tail (method)

**Signature**

```ts
public tail(): Option<List<A>> { ... }
```

## foldl (method)

**Signature**

```ts
public foldl<B>(b: B, f: Function2<B, A, B>): B { ... }
```

## reverse (method)

**Signature**

```ts
public reverse(): List<A> { ... }
```

## filter (method)

**Signature**

```ts
public filter(): List<A> { ... }
```

## drop (method)

**Signature**

```ts
public drop(n: number): List<A> { ... }
```

## init (method)

**Signature**

```ts
public init(): Option<List<A>> { ... }
```

## last (method)

**Signature**

```ts
public last(): Option<A> { ... }
```

## isEmpty (method)

**Signature**

```ts
public isEmpty(): this is Nil<A> { ... }
```

## find (method)

**Signature**

```ts
public find(f: Predicate<A>): Option<A> { ... }
```

## size (method)

**Signature**

```ts
public size(): number { ... }
```

# list (constant)

**Signature**

```ts
export const list = ...
```
