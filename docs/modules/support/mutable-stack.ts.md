---
title: support/mutable-stack.ts
nav_order: 17
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [MutableStack (class)](#mutablestack-class)
  - [push (method)](#push-method)
  - [pop (method)](#pop-method)
  - [peek (method)](#peek-method)
  - [isEmpty (method)](#isempty-method)
  - [size (method)](#size-method)

---

# MutableStack (class)

**Signature**

```ts
export class MutableStack<A> {
  constructor(private readonly array: A[] = []) { ... }
  ...
}
```

## push (method)

**Signature**

```ts
public push(a: A): void { ... }
```

## pop (method)

**Signature**

```ts
public pop(): A | undefined { ... }
```

## peek (method)

**Signature**

```ts
public peek(): A | undefined { ... }
```

## isEmpty (method)

**Signature**

```ts
public isEmpty(): boolean { ... }
```

## size (method)

**Signature**

```ts
public size(): number { ... }
```
