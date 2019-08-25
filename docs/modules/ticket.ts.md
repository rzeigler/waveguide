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
  readonly acquire: Wave<never, A>
  readonly cleanup: Wave<never, void>
}
```

# makeTicket (function)

**Signature**

```ts
export function makeTicket<A>(acquire: Wave<never, A>, cleanup: Wave<never, void>): Ticket<A> { ... }
```

# ticketExit (function)

**Signature**

```ts
export function ticketExit<A>(ticket: Ticket<A>, exit: Exit<never, A>): Wave<never, void> { ... }
```

# ticketUse (function)

**Signature**

```ts
export function ticketUse<A>(ticket: Ticket<A>): Wave<never, A> { ... }
```
