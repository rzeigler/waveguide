---
title: support/completable.ts
nav_order: 14
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Completable (interface)](#completable-interface)
- [completable (function)](#completable-function)

---

# Completable (interface)

**Signature**

```ts
export interface Completable<A> {
  value(): Option<A>
  isComplete(): boolean
  complete(a: A): void
  tryComplete(a: A): boolean
  listen(f: FunctionN<[A], void>): Lazy<void>
}
```

# completable (function)

**Signature**

```ts
export function completable<A>(): Completable<A> { ... }
```
