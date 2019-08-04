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
  readonly acquire: IO<DefaultR, never, A>
  readonly cleanup: IO<DefaultR, never, void>
}
```

# makeTicket (function)

**Signature**

```ts
export function makeTicket<A>(acquire: IO<DefaultR, never, A>, cleanup: IO<DefaultR, never, void>): Ticket<A> { ... }
```

# ticketExit (function)

**Signature**

```ts
export function ticketExit<A>(ticket: Ticket<A>, exit: Exit<never, A>): IO<DefaultR, never, void> { ... }
```

# ticketUse (function)

**Signature**

```ts
export function ticketUse<A>(ticket: Ticket<A>): IO<DefaultR, never, A> { ... }
```
