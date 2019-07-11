---
title: support/mutable-stack.ts
nav_order: 18
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [MutableStack (interface)](#mutablestack-interface)
- [mutableStack (function)](#mutablestack-function)

---

# MutableStack (interface)

**Signature**

```ts
export interface MutableStack<A> {
  push(a: A): void
  pop(): A | undefined
  peek(): A | undefined
  isEmpty(): boolean
  size(): number
}
```

# mutableStack (function)

**Signature**

```ts
export function mutableStack<A>(): MutableStack<A> { ... }
```
