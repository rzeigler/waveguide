---
title: exit.ts
nav_order: 4
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Abort (interface)](#abort-interface)
- [Done (interface)](#done-interface)
- [Interrupt (interface)](#interrupt-interface)
- [Raise (interface)](#raise-interface)
- [Cause (type alias)](#cause-type-alias)
- [Exit (type alias)](#exit-type-alias)
- [interrupt (constant)](#interrupt-constant)
- [abort (function)](#abort-function)
- [done (function)](#done-function)
- [raise (function)](#raise-function)

---

# Abort (interface)

**Signature**

```ts
export interface Abort {
  readonly _tag: 'abort'
  readonly abortedWith: unknown
}
```

# Done (interface)

**Signature**

```ts
export interface Done<A> {
  readonly _tag: 'value'
  readonly value: A
}
```

# Interrupt (interface)

**Signature**

```ts
export interface Interrupt {
  readonly _tag: 'interrupt'
}
```

# Raise (interface)

**Signature**

```ts
export interface Raise<E> {
  readonly _tag: 'raise'
  readonly error: E
}
```

# Cause (type alias)

**Signature**

```ts
export type Cause<E> = Raise<E> | Abort | Interrupt
```

# Exit (type alias)

**Signature**

```ts
export type Exit<E, A> = Done<A> | Cause<E>
```

# interrupt (constant)

**Signature**

```ts
export const interrupt: Interrupt = ...
```

# abort (function)

**Signature**

```ts
export function abort(a: unknown): Abort { ... }
```

# done (function)

**Signature**

```ts
export function done<A>(v: A): Done<A> { ... }
```

# raise (function)

**Signature**

```ts
export function raise<E>(e: E): Raise<E> { ... }
```
