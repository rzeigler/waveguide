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
  readonly acquire: RIO<DefaultR, never, void>
  readonly release: RIO<DefaultR, never, void>
  readonly available: RIO<DefaultR, never, boolean>
  withExclusion<R, E, A>(inner: RIO<R, E, A>): RIO<R, E, A>
}
```

# makeMutex (constant)

**Signature**

```ts
export const  = ...
```
