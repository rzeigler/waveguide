---
title: mutex.ts
nav_order: 7
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Mutex (interface)](#mutex-interface)
- [makeMutex (constant)](#makemutex-constant)

---

# Mutex (interface)

**Signature**

```ts
export interface Mutex {
  readonly acquire: IO<DefaultR, never, void>
  readonly release: IO<DefaultR, never, void>
  readonly available: IO<DefaultR, never, boolean>
  withExclusion<E, A>(inner: IO<DefaultR, E, A>): IO<DefaultR, E, A>
}
```

# makeMutex (constant)

**Signature**

```ts
export const  = ...
```
