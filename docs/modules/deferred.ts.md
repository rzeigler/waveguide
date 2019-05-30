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
  readonly wait: IO<E, A>
  interrupt: IO<never, void>
  done(a: A): IO<never, void>
  error(e: E): IO<never, void>
  from(source: IO<E, A>): IO<never, void>
}
```

# makeDeferred (function)

**Signature**

```ts
export function makeDeferred<E, A, E2 = never>(): IO<E2, Deferred<E, A>> { ... }
```
