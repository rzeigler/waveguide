---
title: support/mutable-queue.ts
nav_order: 17
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [MutableQueue (interface)](#mutablequeue-interface)
- [mutableQueue (function)](#mutablequeue-function)

---

# MutableQueue (interface)

**Signature**

```ts
export interface MutableQueue<A> {
  enqueue(a: A): void
  dequeue(): A | undefined
  peek(): A | undefined
  isEmpty(): boolean
  size(): number
}
```

# mutableQueue (function)

**Signature**

```ts
export function mutableQueue<A>(): MutableQueue<A> { ... }
```
