---
title: concurrent/mutex.ts
nav_order: 3
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Mutex (interface)](#mutex-interface)
- [mutex (constant)](#mutex-constant)

---

# Mutex (interface)

**Signature**

```ts
export interface Mutex {
  readonly acquire: IO<never, void>
  readonly release: IO<never, void>
  readonly available: IO<never, boolean>
  withExclusion<E, A>(inner: IO<E, A>): IO<E, A>
}
```

# mutex (constant)

**Signature**

```ts
export const mutex = ...
```
