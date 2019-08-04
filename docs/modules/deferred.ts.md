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
  readonly wait: RIO<DefaultR, E, A>
  interrupt: RIO<DefaultR, never, void>
  done(a: A): RIO<DefaultR, never, void>
  error(e: E): RIO<DefaultR, never, void>
  from(source: RIO<DefaultR, E, A>): RIO<DefaultR, never, void>
}
```

# makeDeferred (function)

**Signature**

```ts
export function makeDeferred<E, A, E2 = never>(): RIO<DefaultR, E2, Deferred<E, A>> { ... }
```
