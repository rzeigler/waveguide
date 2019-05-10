---
title: resource.ts
nav_order: 10
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Resource (type alias)](#resource-type-alias)
- [URI (type alias)](#uri-type-alias)
- [Bracket (class)](#bracket-class)
  - [map (method)](#map-method)
  - [chain (method)](#chain-method)
  - [use (method)](#use-method)
- [Chain (class)](#chain-class)
  - [map (method)](#map-method-1)
  - [chain (method)](#chain-method-1)
  - [use (method)](#use-method-1)
- [Pure (class)](#pure-class)
  - [map (method)](#map-method-2)
  - [chain (method)](#chain-method-2)
  - [use (method)](#use-method-2)
- [Suspend (class)](#suspend-class)
  - [map (method)](#map-method-3)
  - [chain (method)](#chain-method-3)
  - [use (method)](#use-method-3)
- [URI (constant)](#uri-constant)
- [of (function)](#of-function)
- [resource (function)](#resource-function)
- [suspend (function)](#suspend-function)

---

# Resource (type alias)

**Signature**

```ts
export type Resource<E, A> = Pure<E, A> | Bracket<E, A> | Suspend<E, A> | Chain<E, any, A>
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Bracket (class)

**Signature**

```ts
export class Bracket<E, A> {
  constructor(public readonly acquire: IO<E, A>, public readonly release: Function1<A, IO<E, void>>) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
public map<B>(f: Function1<A, B>): Resource<E, B> { ... }
```

## chain (method)

**Signature**

```ts
public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> { ... }
```

## use (method)

**Signature**

```ts
public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# Chain (class)

**Signature**

```ts
export class Chain<E, L, A> {
  constructor(public readonly left: Resource<E, L>, public readonly f: Function1<L, Resource<E, A>>) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
public map<B>(f: Function1<A, B>): Resource<E, B> { ... }
```

## chain (method)

**Signature**

```ts
public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> { ... }
```

## use (method)

**Signature**

```ts
public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# Pure (class)

**Signature**

```ts
export class Pure<E, A> {
  constructor(public readonly a: A) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
public map<B>(f: Function1<A, B>): Resource<E, B> { ... }
```

## chain (method)

**Signature**

```ts
public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> { ... }
```

## use (method)

**Signature**

```ts
public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# Suspend (class)

**Signature**

```ts
export class Suspend<E, A> {
  constructor(public readonly suspended: IO<E, Resource<E, A>>) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
public map<B>(f: Function1<A, B>): Resource<E, B> { ... }
```

## chain (method)

**Signature**

```ts
public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> { ... }
```

## use (method)

**Signature**

```ts
public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# of (function)

**Signature**

```ts
export function of<E, A>(a: A): Resource<E, A> { ... }
```

# resource (function)

**Signature**

```ts
export function resource<E, A>(acquire: IO<E, A>, release: Function1<A, IO<E, void>>): Resource<E, A> { ... }
```

# suspend (function)

**Signature**

```ts
export function suspend<E, A>(eff: IO<E, Resource<E, A>>): Resource<E, A> { ... }
```
