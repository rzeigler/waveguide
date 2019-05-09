---
title: support/dequeue.ts
nav_order: 14
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Dequeue (class)](#dequeue-class)
  - [take (method)](#take-method)
  - [offer (method)](#offer-method)
  - [pull (method)](#pull-method)
  - [push (method)](#push-method)
  - [peek (method)](#peek-method)
  - [isEmpty (method)](#isempty-method)
  - [size (method)](#size-method)
  - [find (method)](#find-method)
  - [filter (method)](#filter-method)
- [dequeue (constant)](#dequeue-constant)

---

# Dequeue (class)

**Signature**

```ts
export class Dequeue<A> {
  constructor(public readonly front: List<A>, public readonly back: List<A>) { ... }
  ...
}
```

## take (method)

Take an item from the front of this queue

**Signature**

```ts
public take(): Option<readonly [A, Dequeue<A>]> { ... }
```

## offer (method)

Enqueue an item to the back of this queue

**Signature**

```ts
public offer(a: A): Dequeue<A> { ... }
```

## pull (method)

Take an item from the back of this queue

**Signature**

```ts
public pull(): Option<readonly [A, Dequeue<A>]> { ... }
```

## push (method)

Enqueue an item to the front of this queue

**Signature**

```ts
public push(a: A): Dequeue<A> { ... }
```

## peek (method)

Observe the next item that would be removed by take

**Signature**

```ts
public peek(): Option<A> { ... }
```

## isEmpty (method)

**Signature**

```ts
public isEmpty(): boolean { ... }
```

## size (method)

**Signature**

```ts
public size(): number { ... }
```

## find (method)

**Signature**

```ts
public find(f: Predicate<A>): Option<A> { ... }
```

## filter (method)

**Signature**

```ts
public filter(f: Predicate<A>): Dequeue<A> { ... }
```

# dequeue (constant)

**Signature**

```ts
export const dequeue = ...
```
