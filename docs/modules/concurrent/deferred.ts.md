---
title: concurrent/deferred.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Deferred (interface)](#deferred-interface)
- [deferred (constant)](#deferred-constant)

---

# Deferred (interface)

**Signature**

```ts
export interface Deferred<E, A> {
  readonly wait: IO<E, A>
  interrupt: IO<never, void>
  succeed(a: A): IO<never, void>
  fail(e: E): IO<never, void>
  from(source: IO<E, A>): IO<never, void>
}
```

# deferred (constant)

**Signature**

```ts
export const deferred = ...
```
