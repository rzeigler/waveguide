---
title: deferred.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Deferred (interface)](#deferred-interface)
- [makeDeferred (function)](#makedeferred-function)

---

# Deferred (interface)

**Signature**

```ts
export interface Deferred<E, A> {
  /**
   * Wait for this deferred to complete.
   *
   * This effect will produce the value set by done, raise the error set by error or interrupt
   */
  readonly wait: Wave<E, A>
  /**
   * Interrupt any waitersa on this Deferred
   */
  interrupt: Wave<never, void>
  /**
   * Complete this Deferred with a value
   *
   * Any waiters will receive it
   * @param a
   */
  done(a: A): Wave<never, void>
  /**
   *
   * @param e Complete this deferred with an error
   *
   * Any waiters will produce an error
   */
  error(e: E): Wave<never, void>
  /**
   * Set this deferred with the result of source
   * @param source
   */
  from(source: Wave<E, A>): Wave<never, void>
}
```

# makeDeferred (function)

**Signature**

```ts
export function makeDeferred<E, A, E2 = never>(): Wave<E2, Deferred<E, A>> { ... }
```
