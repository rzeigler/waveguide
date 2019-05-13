---
title: ticket.ts
nav_order: 19
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ticket (class)](#ticket-class)
- [ticketExit (function)](#ticketexit-function)
- [ticketUse (function)](#ticketuse-function)

---

# Ticket (class)

**Signature**

```ts
export class Ticket<A> {
  constructor(public readonly acquire: IO<never, A>, public readonly cleanup: IO<never, void>) { ... }
  ...
}
```

# ticketExit (function)

**Signature**

```ts
export function ticketExit(ticket: Ticket<unknown>, exit: Exit<never, unknown>): IO<never, void> { ... }
```

# ticketUse (function)

**Signature**

```ts
export function ticketUse<A>(ticket: Ticket<A>): IO<never, A> { ... }
```
