---
title: ref.ts
nav_order: 9
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ref (interface)](#ref-interface)
- [makeRef (constant)](#makeref-constant)
- [makeRefC (function)](#makerefc-function)

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

# makeRef (constant)

**Signature**

```ts
export const makeRef = ...
```

# makeRefC (function)

Creates an IO that will allocate a Ref.

**Signature**

```ts
export const makeRefC = <E = never>() => <A>(a: A): IO<E, Ref<A>> => effect(() => ...
```
