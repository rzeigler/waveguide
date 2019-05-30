---
title: ref.ts
nav_order: 9
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ref (interface)](#ref-interface)
- [makeRef (function)](#makeref-function)
- [makeRef\_ (function)](#makeref_-function)

---

# Ref (interface)

**Signature**

```ts
export interface Ref<A> {
  readonly get: IO<never, A>
  set(a: A): IO<never, A>
  update(f: FunctionN<[A], A>): IO<never, A>
  modify<B>(f: FunctionN<[A], readonly [B, A]>): IO<never, B>
}
```

# makeRef (function)

Creates an IO that will allocate a Ref.
Curried form of makeRef\_ to allow for inference on the initial type

**Signature**

```ts
export const makeRef = <E = never>() => <A>(initial: A): IO<E, Ref<A>> =>
  sync(() => ...
```

# makeRef\_ (function)

**Signature**

```ts
export function makeRef_<E, A>(initial: A): IO<E, Ref<A>> { ... }
```
