---
title: queue.ts
nav_order: 8
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [ConcurrentQueue (interface)](#concurrentqueue-interface)
- [boundedQueue (function)](#boundedqueue-function)
- [droppingQueue (function)](#droppingqueue-function)
- [slidingQueue (function)](#slidingqueue-function)
- [unboundedQueue (function)](#unboundedqueue-function)

---

# ConcurrentQueue (interface)

**Signature**

```ts
export interface ConcurrentQueue<A> {
  readonly take: Wave<never, A>
  offer(a: A): Wave<never, void>
}
```

# boundedQueue (function)

Create a bounded queue that blocks offers on capacity

**Signature**

```ts
export function boundedQueue<A>(capacity: number): Wave<never, ConcurrentQueue<A>> { ... }
```

# droppingQueue (function)

Create a dropping queue with the given capacity that drops offers on full

**Signature**

```ts
export function droppingQueue<A>(capacity: number): Wave<never, ConcurrentQueue<A>> { ... }
```

# slidingQueue (function)

Create a bounded queue with the given capacity that drops older offers

**Signature**

```ts
export function slidingQueue<A>(capacity: number): Wave<never, ConcurrentQueue<A>> { ... }
```

# unboundedQueue (function)

Create an unbounded concurrent queue

**Signature**

```ts
export function unboundedQueue<A>(): Wave<never, ConcurrentQueue<A>> { ... }
```
