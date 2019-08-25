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
  readonly acquire: Wave<never, void>
  readonly release: Wave<never, void>
  readonly available: Wave<never, boolean>
  withExclusion<R, E, A>(inner: Wave<E, A>): Wave<E, A>
}
```

# makeMutex (constant)

**Signature**

```ts
export const  = ...
```
