---
title: ticket.ts
nav_order: 19
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Ticket (interface)](#ticket-interface)
- [makeTicket (function)](#maketicket-function)
- [ticketExit (function)](#ticketexit-function)
- [ticketUse (function)](#ticketuse-function)

---

# Ticket (interface)

**Signature**

```ts
export interface Ticket<A> {
  readonly acquire: IO<never, A>
  readonly cleanup: IO<never, void>
}
```

# makeTicket (function)

**Signature**

```ts
export function makeTicket<A>(acquire: IO<never, A>, cleanup: IO<never, void>): Ticket<A> { ... }
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
