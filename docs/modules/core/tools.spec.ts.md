---
title: core/tools.spec.ts
nav_order: 25
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [arbVariant (constant)](#arbvariant-constant)
- [arbConstErrorIO (function)](#arbconsterrorio-function)
- [arbConstIO (function)](#arbconstio-function)
- [arbEitherIO (function)](#arbeitherio-function)
- [arbErrorIO (function)](#arberrorio-function)
- [arbErrorKleisliIO (function)](#arberrorkleisliio-function)
- [arbIO (function)](#arbio-function)
- [arbKleisliIO (function)](#arbkleisliio-function)
- [eqvIO (function)](#eqvio-function)
- [exitType (function)](#exittype-function)
- [~~expectExit~~ (function)](#expectexit-function)
- [expectExitIn (function)](#expectexitin-function)

---

# arbVariant (constant)

**Signature**

```ts
export const  = ...
```

# arbConstErrorIO (function)

- Given an E produce an Arbitrary<IO<E, A>> that fails with some evaluation model (sync, succeed, async...)

**Signature**

```ts
export function arbConstErrorIO<E, A>(e: E): Arbitrary<IO<E, A>> { ... }
```

# arbConstIO (function)

**Signature**

```ts
export function arbConstIO<E, A>(a: A): Arbitrary<IO<E, A>> { ... }
```

# arbEitherIO (function)

**Signature**

```ts
export function arbEitherIO<E, A>(arbe: Arbitrary<E>, arba: Arbitrary<A>): Arbitrary<IO<E, A>> { ... }
```

# arbErrorIO (function)

Given an Arbitrary<E> produce an Arbitrary<IO<E, A>> that fails with some evaluation model (sync, succeed, async...)

**Signature**

```ts
export function arbErrorIO<E, A>(arbE: Arbitrary<E>): Arbitrary<IO<E, A>> { ... }
```

# arbErrorKleisliIO (function)

**Signature**

```ts
export function arbErrorKleisliIO<E, E2, A>(arbEE: Arbitrary<Function1<E, E2>>): Arbitrary<Function1<E, IO<E2, A>>> { ... }
```

# arbIO (function)

**Signature**

```ts
export function arbIO<E, A>(arb: Arbitrary<A>): Arbitrary<IO<E, A>> { ... }
```

# arbKleisliIO (function)

Construct a Arbitrary of Kleisli IO A B given an arbitrary of A => B

Used for testing Chain/Monad laws while ensuring we exercise asynchronous machinery

**Signature**

```ts
export function arbKleisliIO<E, A, B>(arbAB: Arbitrary<Function1<A, B>>): Arbitrary<Function1<A, IO<E, B>>> { ... }
```

# eqvIO (function)

**Signature**

```ts
export function eqvIO<E, A>(io1: IO<E, A>, io2: IO<E, A>): Promise<boolean> { ... }
```

# exitType (function)

**Signature**

```ts
export function exitType<E, A>(io1: IO<E, A>, tag: Exit<E, A>["_tag"]): Promise<void> { ... }
```

# ~~expectExit~~ (function)

**Signature**

```ts
export function expectExit<E, A>(ioa: IO<E, A>, expected: Exit<E, A>): Promise<void> { ... }
```

# expectExitIn (function)

**Signature**

```ts
export function expectExitIn<E, A, B>(ioa: IO<E, A>, f: Function1<Exit<E, A>, B>, expected: B): Promise<void> { ... }
```
