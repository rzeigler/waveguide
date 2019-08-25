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
  /**
   * Get the current value of the Ref
   */
  readonly get: Wave<never, A>
  /**
   * Set the current value of the ref
   * @param a
   */
  set(a: A): Wave<never, A>
  /**
   * Update the current value of the ref with a function.
   * Produces the new value
   * @param f
   */
  update(f: FunctionN<[A], A>): Wave<never, A>
  /**
   * Update the current value of a ref with a function.
   *
   * This function may return a second value of type B that will be produced on complete
   * @param f
   */
  modify<B>(f: FunctionN<[A], readonly [B, A]>): Wave<never, B>
}
```

# makeRef (function)

Creates an IO that will allocate a Ref.
Curried form of makeRef\_ to allow for inference on the initial type

**Signature**

```ts
export const makeRef = <A>(initial: A): Wave<never, Ref<A>> =>
    sync(() => ...
```
