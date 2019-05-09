---
title: core/fiber.ts
nav_order: 16
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Fiber (interface)](#fiber-interface)
- [FiberContext (class)](#fibercontext-class)
  - [start (method)](#start-method)
- [fiber (constant)](#fiber-constant)

---

# Fiber (interface)

**Signature**

```ts
export interface Fiber<E, A> {
  readonly name: Option<string>
  readonly interrupt: IO<never, void>
  readonly wait: IO<never, Exit<E, A>>
  readonly join: IO<E, A>
  readonly result: IO<E, Option<A>>
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

# fiber (constant)

**Signature**

```ts
export const fiber = ...
```
