---
title: semaphore.ts
nav_order: 12
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Semaphore (interface)](#semaphore-interface)
- [SemaphoreR (interface)](#semaphorer-interface)
- [liftSemaphore (function)](#liftsemaphore-function)
- [makeSemaphore (function)](#makesemaphore-function)
- [makeSemaphoreR (function)](#makesemaphorer-function)

---

# Semaphore (interface)

**Signature**

```ts
export interface Semaphore {
  /**
   * Acquire a permit, blocking if not all are vailable
   */
  readonly acquire: Wave<never, void>
  /**
   * Release a permit
   */
  readonly release: Wave<never, void>
  /**
   * Get the number of available permits
   */
  readonly available: Wave<never, number>

  /**
   * Acquire multiple permits blocking if not all are available
   * @param n
   */
  acquireN(n: number): Wave<never, void>
  /**
   * Release mutliple permits
   * @param n
   */
  releaseN(n: number): Wave<never, void>
  /**
   * Bracket the given io with acquireN/releaseN calls
   * @param n
   * @param io
   */
  withPermitsN<E, A>(n: number, io: Wave<E, A>): Wave<E, A>
  /**
   * withPermitN(1, _)
   * @param n
   */
  withPermit<E, A>(n: Wave<E, A>): Wave<E, A>
}
```

# SemaphoreR (interface)

**Signature**

```ts
export interface SemaphoreR {
  acquireN(n: number): WaveR<{}, never, void>
  readonly acquire: WaveR<{}, never, void>
  releaseN(n: number): WaveR<{}, never, void>
  readonly release: WaveR<{}, never, void>
  withPermitsN<R, E, A>(n: number, wave: WaveR<R, E, A>): WaveR<R, E, A>
  withPermit<R, E, A>(wave: WaveR<R, E, A>): WaveR<R, E, A>
  readonly available: WaveR<{}, never, number>
}
```

# liftSemaphore (function)

**Signature**

```ts
export function liftSemaphore(sem: Semaphore): SemaphoreR { ... }
```

# makeSemaphore (function)

Allocate a semaphore.

**Signature**

```ts
export function makeSemaphore(n: number): Wave<never, Semaphore> { ... }
```

# makeSemaphoreR (function)

**Signature**

```ts
export function makeSemaphoreR(n: number): WaveR<{}, never, SemaphoreR> { ... }
```
