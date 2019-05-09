---
title: driver.ts
nav_order: 3
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [FrameType (type alias)](#frametype-type-alias)
- [Driver (class)](#driver-class)
  - [start (method)](#start-method)
  - [interrupt (method)](#interrupt-method)
  - [onExit (method)](#onexit-method)
  - [exit (method)](#exit-method)
  - [loop (method)](#loop-method)
  - [resumeInterrupt (method)](#resumeinterrupt-method)
  - [isInterruptible (method)](#isinterruptible-method)
  - [canRecover (method)](#canrecover-method)
  - [next (method)](#next-method)
  - [handle (method)](#handle-method)
  - [done (method)](#done-method)
  - [contextSwitch (method)](#contextswitch-method)
  - [resume (method)](#resume-method)

---

# FrameType (type alias)

**Signature**

```ts
export type FrameType = Frame | FoldFrame | InterruptFrame
```

# Driver (class)

The driver for executing IO actions.

Provides a runtime and necessary state context to evaluate an IO

**Signature**

```ts
export class Driver<E, A> {
  constructor(private readonly init: IO<E, A>, private readonly runtime: Runtime = defaultRuntime) { ... }
  ...
}
```

## start (method)

Start executing this driver.

This executes the runloop in a trampoline so start may unwind before IO begin evaluating depending on the
state of the stack

**Signature**

```ts
@boundMethod
  public start() { ... }
```

## interrupt (method)

Interrupt the execution of the fiber running on this driver

**Signature**

```ts
@boundMethod
  public interrupt(): void { ... }
```

## onExit (method)

**Signature**

```ts
@boundMethod
  public onExit(f: Function1<Exit<E, A>, void>): Lazy<void> { ... }
```

## exit (method)

**Signature**

```ts
@boundMethod
  public exit(): Option<Exit<E, A>> { ... }
```

## loop (method)

**Signature**

```ts
private loop(next: IO<unknown, unknown>): void { ... }
```

## resumeInterrupt (method)

Resume the runloop with an interrupted

**Signature**

```ts
private resumeInterrupt(): void { ... }
```

## isInterruptible (method)

**Signature**

```ts
private isInterruptible(): boolean { ... }
```

## canRecover (method)

Recovering from a failure is allowed when that failure is not interrupted or we are in an uninterruptible region

**Signature**

```ts
private canRecover(cause: Cause<unknown>): boolean { ... }
```

## next (method)

**Signature**

```ts
private next(value: unknown): IO<unknown, unknown> | undefined { ... }
```

## handle (method)

**Signature**

```ts
private handle(e: Cause<unknown>): IO<unknown, unknown> | undefined { ... }
```

## done (method)

**Signature**

```ts
private done(exit: Exit<E, A>): void { ... }
```

## contextSwitch (method)

**Signature**

```ts
private contextSwitch(op: Function1<Function1<Either<unknown, unknown>, void>, Lazy<void>>): void { ... }
```

## resume (method)

**Signature**

```ts
private resume(result: Either<unknown, unknown>): void { ... }
```
