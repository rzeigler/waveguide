---
title: fiber.ts
nav_order: 5
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Fiber (interface)](#fiber-interface)
- [FiberContext (class)](#fibercontext-class)
  - [start (method)](#start-method)
- [joinFiber (function)](#joinfiber-function)
- [makeFiber (function)](#makefiber-function)
- [wrapFiber (function)](#wrapfiber-function)

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

# FiberContext (class)

**Signature**

```ts
export class FiberContext<E, A> {
  constructor(private readonly driver: Driver<E, A>, name?: string) { ... }
  ...
}
```

## start (method)

**Signature**

```ts
public start() { ... }
```

# joinFiber (function)

**Signature**

```ts
export function joinFiber<E, A>(fib: Fiber<E, A>): IO<E, A> { ... }
```

# makeFiber (function)

**Signature**

```ts
export function makeFiber<E, A>(init: IO<E, A>, runtime: Runtime, name?: string): IO<never, Fiber<E, A>> { ... }
```

# wrapFiber (function)

**Signature**

```ts
export function wrapFiber<E, A>(driver: Driver<E, A>): Fiber<E, A> { ... }
```
