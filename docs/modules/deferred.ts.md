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
  readonly wait: IO<DefaultR, E, A>
  interrupt: IO<DefaultR, never, void>
  done(a: A): IO<DefaultR, never, void>
  error(e: E): IO<DefaultR, never, void>
  from(source: IO<DefaultR, E, A>): IO<DefaultR, never, void>
}
```

# makeDeferred (function)

**Signature**

```ts
export function makeDeferred<E, A, E2 = never>(): IO<DefaultR, E2, Deferred<E, A>> { ... }
```
