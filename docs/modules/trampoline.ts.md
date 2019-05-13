---
title: trampoline.ts
nav_order: 20
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Trampoline (class)](#trampoline-class)
  - [dispatch (method)](#dispatch-method)
  - [isRunning (method)](#isrunning-method)
  - [run (method)](#run-method)

---

# Trampoline (class)

A trampolined execution environment.

In order to drive rendezvouz between multiple running fibers it is important to be able to commence running a fiber
without growing the stack.
Otherwise, arbitrary numbers of constructs like deferred will cause unbounded stack growth.

**Signature**

```ts
export class Trampoline { ... }
```

## dispatch (method)

Dispatch a thunk against this trampoline.

If the trampoline is not currently active this immediately begins executing the thunk.
If the trampoline is currently active then the thunk will be appended to a queue

**Signature**

```ts
public dispatch(thunk: Lazy<void>): void { ... }
```

## isRunning (method)

Is the trampoline currently executing?

**Signature**

```ts
public isRunning(): boolean { ... }
```

## run (method)

**Signature**

```ts
private run(): void { ... }
```
