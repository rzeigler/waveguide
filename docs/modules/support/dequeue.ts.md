---
title: support/dequeue.ts
nav_order: 14
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Dequeue (class)](#dequeue-class)
  - [take (method)](#take-method)
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
public take(): Option<readonly [A, Dequeue<A { ... }
```

# dequeue (constant)

**Signature**

```ts
export const dequeue = ...
```
