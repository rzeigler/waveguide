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
  readonly take: IO<DefaultR, never, A>
  offer(a: A): IO<DefaultR, never, void>
}
```

# boundedQueue (function)

**Signature**

```ts
export function boundedQueue<A>(capacity: number): IO<DefaultR, never, ConcurrentQueue<A>> { ... }
```

# droppingQueue (function)

**Signature**

```ts
export function droppingQueue<A>(capacity: number): IO<DefaultR, never, ConcurrentQueue<A>> { ... }
```

# slidingQueue (function)

**Signature**

```ts
export function slidingQueue<A>(capacity: number): IO<DefaultR, never, ConcurrentQueue<A>> { ... }
```

# unboundedQueue (function)

**Signature**

```ts
export function unboundedQueue<A>(): IO<DefaultR, never, ConcurrentQueue<A>> { ... }
```
