---
title: concurrent/ref.ts
nav_order: 6
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ref (interface)](#ref-interface)
- [ref (constant)](#ref-constant)

---

# Ref (interface)

**Signature**

```ts
export interface Ref<A> {
  readonly get: IO<never, A>
  set(a: A): IO<never, A>
  update(f: Function1<A, A>): IO<never, A>
  modify<B>(f: Function1<A, readonly [B, A]>): IO<never, B>
}
```

# ref (constant)

**Signature**

```ts
export const ref = ...
```
