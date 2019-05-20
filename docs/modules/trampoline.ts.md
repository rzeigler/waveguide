---
title: trampoline.ts
nav_order: 20
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Trampoline (interface)](#trampoline-interface)
- [makeTrampoline (function)](#maketrampoline-function)

---

# Trampoline (interface)

A trampolined execution environment.

In order to drive rendezvouz between multiple running fibers it is important to be able to commence running a fiber
without growing the stack.
Otherwise, arbitrary numbers of constructs like deferred will cause unbounded stack growth.

**Signature**

```ts
export interface Trampoline {
  /**
   * Is the trampoline currently running
   */
  isRunning(): boolean
  /**
   * Dispatch a thunk against this trampoline.
   *
   * If the trampoline is not currently active this immediately begins executing the thunk.
   * If the trampoline is currently active then the thunk will be appended to a queue
   * @param thunk
   */
  dispatch(thunk: Lazy<void>): void
}
```

# makeTrampoline (function)

Create a new Trampoline

**Signature**

```ts
export function makeTrampoline(): Trampoline { ... }
```
