---
title: ref.ts
nav_order: 9
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ref (interface)](#ref-interface)
- [makeRef (function)](#makeref-function)

---

# Ref (interface)

**Signature**

```ts
export interface Ref<A> {
  readonly get: RIO<DefaultR, never, A>
  set(a: A): RIO<DefaultR, never, A>
  update(f: FunctionN<[A], A>): RIO<DefaultR, never, A>
  modify<B>(f: FunctionN<[A], readonly [B, A]>): RIO<DefaultR, never, B>
}
```

# makeRef (function)

Creates an IO that will allocate a Ref.
Curried form of makeRef\_ to allow for inference on the initial type

**Signature**

```ts
export const makeRef = <A>(initial: A): RIO<DefaultR, never, Ref<A>> =>
    sync(() => ...
```
