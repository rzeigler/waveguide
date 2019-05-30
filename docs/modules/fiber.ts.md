---
title: fiber.ts
nav_order: 5
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Fiber (interface)](#fiber-interface)
- [makeFiber (function)](#makefiber-function)

---

# Fiber (interface)

**Signature**

```ts
export interface Fiber<E, A> {
  /**
   * The name of the fiber
   */
  readonly name: Option<string>
  /**
   * Send an interrupt signal to this fiber.
   *
   * The this will complete execution once the target fiber has halted.
   * Does nothing if the target fiber is already complete
   */
  readonly interrupt: IO<never, void>
  /**
   * Await the result of this fiber
   */
  readonly wait: IO<never, Exit<E, A>>
  /**
   * Join with this fiber.
   * This is equivalent to fiber.wait.chain(io.completeWith)
   */
  readonly join: IO<E, A>
  /**
   * Poll for a fiber result
   */
  readonly result: IO<E, Option<A>>
  /**
   * Determine if the fiber is complete
   */
  readonly isComplete: IO<never, boolean>
}
```

# makeFiber (function)

**Signature**

```ts
export function makeFiber<E, A>(init: IO<E, A>, runtime: Runtime, name?: string): IO<never, Fiber<E, A>> { ... }
```
