---
title: semaphore.ts
nav_order: 13
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Semaphore (interface)](#semaphore-interface)
- [makeSemaphore (function)](#makesemaphore-function)

---

# Semaphore (interface)

**Signature**

```ts
export interface Semaphore {
  readonly acquire: IO<never, void>
  readonly release: IO<never, void>
  readonly available: IO<never, number>

  acquireN(n: number): IO<never, void>
  releaseN(n: number): IO<never, void>
  withPermitsN<E, A>(n: number, io: IO<E, A>): IO<E, A>
  withPermit<E, A>(n: IO<E, A>): IO<E, A>
}
```

# makeSemaphore (function)

Allocate a semaphore.

**Signature**

```ts
export function makeSemaphore(n: number): IO<never, Semaphore> { ... }
```
