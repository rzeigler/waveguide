---
title: core/resource.ts
nav_order: 23
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [URI (type alias)](#uri-type-alias)
- [Resource (class)](#resource-class)
- [URI (constant)](#uri-constant)

---

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Resource (class)

**Signature**

```ts
export class Resource<E, A> {
  constructor(public readonly acquire: IO<E, A>,
              public readonly release: Function1<A, IO<E, void>>) { ... }
  ...
}
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```
