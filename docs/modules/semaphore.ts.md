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
  readonly acquire: RIO<DefaultR, never, void>
  readonly release: RIO<DefaultR, never, void>
  readonly available: RIO<DefaultR, never, number>

  acquireN(n: number): RIO<DefaultR, never, void>
  releaseN(n: number): RIO<DefaultR, never, void>
  withPermitsN<E, A>(n: number, io: RIO<DefaultR, E, A>): RIO<DefaultR, E, A>
  withPermit<E, A>(n: RIO<DefaultR, E, A>): RIO<DefaultR, E, A>
}
```

# makeSemaphore (function)

Allocate a semaphore.

**Signature**

```ts
export function makeSemaphore(n: number): RIO<DefaultR, never, Semaphore> { ... }
```
