---
title: exit.ts
nav_order: 4
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Cause (type alias)](#cause-type-alias)
- [Exit (type alias)](#exit-type-alias)
- [Aborted (class)](#aborted-class)
- [Failed (class)](#failed-class)
- [Interrupted (class)](#interrupted-class)
- [Value (class)](#value-class)

---

# Cause (type alias)

**Signature**

```ts
export type Cause<E> = Failed<E> | Aborted | Interrupted
```

# Exit (type alias)

**Signature**

```ts
export type Exit<E, A> = Value<A> | Cause<E>
```

# Aborted (class)

**Signature**

```ts
export class Aborted {
  constructor(public readonly error: unknown) { ... }
  ...
}
```

# Failed (class)

**Signature**

```ts
export class Failed<E> {
  constructor(public readonly error: E) { ... }
  ...
}
```

# Interrupted (class)

**Signature**

```ts
export class Interrupted { ... }
```

# Value (class)

**Signature**

```ts
export class Value<A> {
  constructor(public readonly value: A) { ... }
  ...
}
```
