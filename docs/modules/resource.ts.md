---
title: resource.ts
nav_order: 10
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [URI (type alias)](#uri-type-alias)
- [Resource (class)](#resource-class)
  - [map (method)](#map-method)
  - [zipWith (method)](#zipwith-method)
  - [zip (method)](#zip-method)
  - [ap (method)](#ap-method)
  - [ap\_ (method)](#ap_-method)
  - [chain (method)](#chain-method)
  - [use (method)](#use-method)
- [URI (constant)](#uri-constant)
- [resource (constant)](#resource-constant)
- [from (function)](#from-function)
- [of (function)](#of-function)
- [suspend (function)](#suspend-function)

---

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Resource (class)

**Signature**

```ts
export class Resource<E, A> {
  constructor(private readonly step: ResourceADT<E, A>) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
public map<B>(f: Function1<A, B>): Resource<E, B> { ... }
```

## zipWith (method)

**Signature**

```ts
public zipWith<B, C>(other: Resource<E, B>, f: Function2<A, B, C>): Resource<E, C> { ... }
```

## zip (method)

**Signature**

```ts
public zip<B>(other: Resource<E, B>): Resource<E, readonly [A, B]> { ... }
```

## ap (method)

**Signature**

```ts
public ap<B>(other: Resource<E, Function1<A, B>>): Resource<E, B> { ... }
```

## ap\_ (method)

**Signature**

```ts
public ap_<B, C>(this: Resource<E, Function1<B, C>>, other: Resource<E, B>): Resource<E, C> { ... }
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

# resource (constant)

**Signature**

```ts
export const resource: Monad2<URI> = ...
```

# from (function)

**Signature**

```ts
export function from<E, A>(acquire: IO<E, A>, release: Function1<A, IO<E, void>>): Resource<E, A> { ... }
```

# of (function)

**Signature**

```ts
export function of<E, A>(a: A): Resource<E, A> { ... }
```

# suspend (function)

**Signature**

```ts
export function suspend<E, A>(eff: IO<E, Resource<E, A>>): Resource<E, A> { ... }
```
