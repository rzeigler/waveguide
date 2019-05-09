---
title: support/completable.ts
nav_order: 13
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Completable (class)](#completable-class)
  - [value (method)](#value-method)
  - [isComplete (method)](#iscomplete-method)
  - [complete (method)](#complete-method)
  - [tryComplete (method)](#trycomplete-method)
  - [listen (method)](#listen-method)
  - [set (method)](#set-method)

---

# Completable (class)

An initial empty receptacle for a value that may be set at most once

**Signature**

```ts
export class Completable<A> { ... }
```

## value (method)

Get the value that has been set

**Signature**

```ts
public value(): Option<A> { ... }
```

## isComplete (method)

Is this completed filled

**Signature**

```ts
public isComplete(): boolean { ... }
```

## complete (method)

Complete this with the value a

Thrwos an exception if this is already complete

**Signature**

```ts
@boundMethod
  public complete(a: A): void { ... }
```

## tryComplete (method)

Attempt to complete this with value a

Returns true if this wasn't already set and false otherwise

**Signature**

```ts
@boundMethod
  public tryComplete(a: A): boolean { ... }
```

## listen (method)

Register a listener for the completion of this with a value

Returns an action that can be used to cancel the listening

**Signature**

```ts
@boundMethod
  public listen(f: Function1<A, void>): Lazy<void> { ... }
```

## set (method)

**Signature**

```ts
@boundMethod
  private set(a: A): void { ... }
```
