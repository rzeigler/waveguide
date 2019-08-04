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
  readonly acquire: IO<DefaultR, never, void>
  readonly release: IO<DefaultR, never, void>
  readonly available: IO<DefaultR, never, number>

  acquireN(n: number): IO<DefaultR, never, void>
  releaseN(n: number): IO<DefaultR, never, void>
  withPermitsN<E, A>(n: number, io: IO<DefaultR, E, A>): IO<DefaultR, E, A>
  withPermit<E, A>(n: IO<DefaultR, E, A>): IO<DefaultR, E, A>
}
```

# makeSemaphore (function)

Allocate a semaphore.

**Signature**

```ts
export function makeSemaphore(n: number): IO<DefaultR, never, Semaphore> { ... }
```
