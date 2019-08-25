---
title: support/dequeue.ts
nav_order: 14
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Dequeue (interface)](#dequeue-interface)
- [empty (function)](#empty-function)
- [from (function)](#from-function)
- [of (function)](#of-function)

---

# Dequeue (interface)

**Signature**

```ts
export interface Dequeue<A> {
  take(): Option<readonly [A, Dequeue<A>]>
  offer(a: A): Dequeue<A>
  pull(): Option<readonly [A, Dequeue<A>]>
  push(a: A): Dequeue<A>
  filter(f: Predicate<A>): Dequeue<A>
  find(p: Predicate<A>): Option<A>
  size(): number
  isEmpty(): boolean
}
```

# empty (function)

**Signature**

```ts
export function empty<A>(): Dequeue<A> { ... }
```

# from (function)

**Signature**

```ts
export function from<A>(front: List<A>, back: List<A>): Dequeue<A> { ... }
```

# of (function)

**Signature**

```ts
export function of<A>(a: A): Dequeue<A> { ... }
```
