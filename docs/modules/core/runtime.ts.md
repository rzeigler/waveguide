---
title: core/runtime.ts
nav_order: 24
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Runtime (interface)](#runtime-interface)
- [defaultRuntime (constant)](#defaultruntime-constant)

---

# Runtime (interface)

An interface for the IO system runtime.

Allows dispatching arbitrary blocks of code immediately or after some delay

**Signature**

```ts
export interface Runtime {
  /**
   * Dispatch a thunk immediately.
   *
   * The default runtime trampolines this dispatch to for stack safety.
   * @param thunk the action to execute
   */
  dispatch(thunk: Lazy<void>): void

  /**
   * Dispatch a thunk after some amount of time has elapsed.
   *
   * Returns an actions that may be used to cancel execution.
   * The default runtime delegates to setTimeout.
   * @param thunk the action to execute
   * @param ms delay in milliseconds
   */
  dispatchLater(thunk: Lazy<void>, ms: number): Lazy<void>
}
```

# defaultRuntime (constant)

**Signature**

```ts
export const defaultRuntime: Runtime = ...
```
