---
title: console.ts
nav_order: 1
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [error (function)](#error-function)
- [errorR (function)](#errorr-function)
- [log (function)](#log-function)
- [logR (function)](#logr-function)
- [warn (function)](#warn-function)
- [warnR (function)](#warnr-function)

---

# error (function)

Suspend console.error in a Wave

**Signature**

```ts
export function error(msg?: any, ...more: any[]): Wave<never, void> { ... }
```

# errorR (function)

Suspend console.error in a WaveR

**Signature**

```ts
export function errorR<R = {}>(msg?: any, ...more: any[]): WaveR<R, never, void> { ... }
```

# log (function)

Suspend console.log in a Wave

**Signature**

```ts
export function log(msg?: any, ...more: any[]): Wave<never, void> { ... }
```

# logR (function)

Suspend console.log in a WaveR

**Signature**

```ts
export function logR<R = {}>(msg?: any, ...more: any[]): WaveR<R, never, void> { ... }
```

# warn (function)

Suspend console.warn in a Wave

**Signature**

```ts
export function warn(msg?: any, ...more: any[]): Wave<never, void> { ... }
```

# warnR (function)

Suspend console.warn in a WaveR

**Signature**

```ts
export function warnR<R = {}>(msg?: any, ...more: any[]): WaveR<R, never, void> { ... }
```
