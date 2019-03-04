
waveguide
=========

[![npm version](https://badge.fury.io/js/waveguide.svg)](https://badge.fury.io/js/waveguide)

Waveguide is a set of modules provided datatypes for encoding effects on Javascript platforms inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio). This is the core module which provides the effect type IO as well as a number of concurrency primatives.

IO is:

*   Lazy. Work is not done until explicitly asked for and interruption can be used to stop work that is no longer needed.
*   Unifies synchronous and asynchronous effects. The core runloop will run until an asynchronous boundary is encountered and then suspend. It is always possible to manually insert asynchronous boundaries manually to avoid blocking the main thread
*   Resource safe. Exposes a number of primitives for working with resources
*   Concurrent. Exposes a logical fiber threading model with support for joins and interrupts.

For more information see the [docs](./docs/README.md)

Getting Started
---------------

```
import { IO } from "waveguide"
```

Constructing an IO
------------------

There are a number of ways of constructing IOs. `IO.of` and `IO.failed` allow creating IOs from know values. Additionally, `IO.eval` and `IO.suspend` create IOs from side effecting functions. `IO.async` creates an asynchronous IO and `IO.assimilate` creates an IO from a promise factory.

Using an IO
-----------

`IO<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) There are parallel variants of a number of functions like ap, applyFirst/Second, and map2. Furthermore, there are a several resource acquisition functions such as `bracket` and `ensuring` which guarantee IO actions happen in the fact of errors or interuption. These respect the 'critical' method which marks an IO as a critical section and as such should be interruptible.

Fibers
------

An `IO<E, A>` may be converted to a fiber using `fork()`. The result being an `IO<never, Fiber<E, A>>`. The IO action is now running in the background and can be interrupted, waited, or joined. `interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in. A fiber will always run its finalizers even in the face of interruption. `join` will halt the progress of the current fiber until the result of the target fiber is known. `wait` will await the termination of a fiber either by interruption or completion. In particular, if you need to know when a fiber has finished its finalizers after being interrupted, you may use `wait`.

Running
-------

IOs are lazy so they don't actually do anything until they are interpreted. `launch` will begin running a fiber and returns a cancellation action. `promised` will return a promise of the result of the fiber and will not resolve in the face of interruption. `promisedResult` will return a promise of a FiberResult.

Concurrency Abstractions
------------------------

Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), and Semaphore.

## Index

### Classes

* [Abort](classes/abort.md)
* [Async](classes/async.md)
* [AsyncFrame](classes/asyncframe.md)
* [Caused](classes/caused.md)
* [Chain](classes/chain.md)
* [ChainError](classes/chainerror.md)
* [ChainFrame](classes/chainframe.md)
* [Critical](classes/critical.md)
* [Deferred](classes/deferred.md)
* [Dequeue](classes/dequeue.md)
* [ErrorFrame](classes/errorframe.md)
* [Failed](classes/failed.md)
* [Fiber](classes/fiber.md)
* [FinalizeFrame](classes/finalizeframe.md)
* [First](classes/first.md)
* [ForwardProxy](classes/forwardproxy.md)
* [IO](classes/io.md)
* [InterruptFrame](classes/interruptframe.md)
* [Interrupted](classes/interrupted.md)
* [Mutex](classes/mutex.md)
* [Of](classes/of.md)
* [OnDone](classes/ondone.md)
* [OnInterrupted](classes/oninterrupted.md)
* [OneShot](classes/oneshot.md)
* [Raise](classes/raise.md)
* [Ref](classes/ref.md)
* [Runtime](classes/runtime.md)
* [Second](classes/second.md)
* [Semaphore](classes/semaphore.md)
* [Suspend](classes/suspend.md)
* [Terminal](classes/terminal.md)
* [Ticket](classes/ticket.md)
* [Value](classes/value.md)

### Interfaces

* [Call](interfaces/call.md)

### Type aliases

* [Attempt](#attempt)
* [Cause](#cause)
* [FiberResult](#fiberresult)
* [Frame](#frame)
* [IOStep](#iostep)
* [OneOf](#oneof)
* [Reservation](#reservation)
* [Result](#result)
* [State](#state)
* [UIO](#uio)

### Variables

* [interrupted](#interrupted)
* [terminal](#terminal)

### Functions

* [compositeCause](#compositecause)
* [countPermits](#countpermits)
* [createCompositeFinalizer](#createcompositefinalizer)
* [fiberInterrupt](#fiberinterrupt)
* [raceInto](#raceinto)
* [sanityCheck](#sanitycheck)
* [ticketN](#ticketn)

---

## Type aliases

<a id="attempt"></a>

###  Attempt

**Ƭ Attempt**: *[Raise](classes/raise.md)<`E`> \| [Value](classes/value.md)<`A`>*

*Defined in [result.ts:25](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L25)*

___
<a id="cause"></a>

###  Cause

**Ƭ Cause**: *[Raise](classes/raise.md)<`E`> \| [Abort](classes/abort.md)*

*Defined in [result.ts:32](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L32)*

___
<a id="fiberresult"></a>

###  FiberResult

**Ƭ FiberResult**: *[Interrupted](classes/interrupted.md) \| [Result](#result)<`E`, `A`>*

*Defined in [result.ts:15](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L15)*

___
<a id="frame"></a>

###  Frame

**Ƭ Frame**: *[ChainFrame](classes/chainframe.md) \| [ErrorFrame](classes/errorframe.md) \| [FinalizeFrame](classes/finalizeframe.md) \| [InterruptFrame](classes/interruptframe.md)*

*Defined in [runtime.ts:21](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L21)*

___
<a id="iostep"></a>

###  IOStep

**Ƭ IOStep**: *[Of](classes/of.md)<`A`> \| [Failed](classes/failed.md)<`E`> \| [Caused](classes/caused.md)<`E`> \| [Suspend](classes/suspend.md)<`E`, `A`> \| [Async](classes/async.md)<`E`, `A`> \| [Critical](classes/critical.md)<`E`, `A`> \| [Chain](classes/chain.md)<`E`, `any`, `A`> \| [ChainError](classes/chainerror.md)<`E`, `any`, `A`> \| [OnDone](classes/ondone.md)<`E`, `any`, `A`> \| [OnInterrupted](classes/oninterrupted.md)<`E`, `any`, `A`>*

*Defined in [iostep.ts:32](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/iostep.ts#L32)*

___
<a id="oneof"></a>

###  OneOf

**Ƭ OneOf**: *[First](classes/first.md)<`A`> \| [Second](classes/second.md)<`B`>*

*Defined in [result.ts:50](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L50)*

___
<a id="reservation"></a>

###  Reservation

**Ƭ Reservation**: *[`number`, [Deferred](classes/deferred.md)<`void`>]*

*Defined in [semaphore.ts:23](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/semaphore.ts#L23)*

___
<a id="result"></a>

###  Result

**Ƭ Result**: *[Cause](#cause)<`E`> \| [Value](classes/value.md)<`A`>*

*Defined in [result.ts:23](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L23)*

___
<a id="state"></a>

###  State

**Ƭ State**: *[OneOf](#oneof)<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>*

*Defined in [semaphore.ts:24](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/semaphore.ts#L24)*

___
<a id="uio"></a>

###  UIO

**Ƭ UIO**: *[IO](classes/io.md)<`never`, `A`>*

*Defined in [io.ts:23](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/io.ts#L23)*

___

## Variables

<a id="interrupted"></a>

### `<Const>` interrupted

**● interrupted**: *[Interrupted](classes/interrupted.md)* =  new Interrupted()

*Defined in [result.ts:21](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L21)*

___
<a id="terminal"></a>

### `<Const>` terminal

**● terminal**: *[Terminal](classes/terminal.md)* =  new Terminal()

*Defined in [terminal.ts:31](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/terminal.ts#L31)*

___

## Functions

<a id="compositecause"></a>

### `<Const>` compositeCause

▸ **compositeCause**(base: *[Cause](#cause)<`unknown`>*): `(Anonymous function)`

*Defined in [runtime.ts:350](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L350)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| base | [Cause](#cause)<`unknown`> |

**Returns:** `(Anonymous function)`

___
<a id="countpermits"></a>

###  countPermits

▸ **countPermits**(state: *[State](#state)*): `number`

*Defined in [semaphore.ts:117](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/semaphore.ts#L117)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | [State](#state) |

**Returns:** `number`

___
<a id="createcompositefinalizer"></a>

###  createCompositeFinalizer

▸ **createCompositeFinalizer**(cause: *[Cause](#cause)<`unknown`>*, finalizers: *[FinalizeFrame](classes/finalizeframe.md)[]*): [IO](classes/io.md)<`unknown`, `unknown`>

*Defined in [runtime.ts:342](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L342)*

Create a single composite uninterruptible finalizer

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| cause | [Cause](#cause)<`unknown`> |  The initial cause to rethrow |
| finalizers | [FinalizeFrame](classes/finalizeframe.md)[] |

**Returns:** [IO](classes/io.md)<`unknown`, `unknown`>
and IO action that executes all of the finalizers

___
<a id="fiberinterrupt"></a>

###  fiberInterrupt

▸ **fiberInterrupt**<`E`,`A`>(fiber: *[Fiber](classes/fiber.md)<`E`, `A`>*): [IO](classes/io.md)<`never`, `void`>

*Defined in [io.ts:640](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/io.ts#L640)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fiber | [Fiber](classes/fiber.md)<`E`, `A`> |

**Returns:** [IO](classes/io.md)<`never`, `void`>

___
<a id="raceinto"></a>

###  raceInto

▸ **raceInto**<`E`,`A`>(defer: *[Deferred](classes/deferred.md)<[Result](#result)<`E`, `A`>>*, io: *[IO](classes/io.md)<`E`, `A`>*): [IO](classes/io.md)<`never`, [Fiber](classes/fiber.md)<`never`, `void`>>

*Defined in [io.ts:632](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/io.ts#L632)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| defer | [Deferred](classes/deferred.md)<[Result](#result)<`E`, `A`>> |
| io | [IO](classes/io.md)<`E`, `A`> |

**Returns:** [IO](classes/io.md)<`never`, [Fiber](classes/fiber.md)<`never`, `void`>>

___
<a id="sanitycheck"></a>

###  sanityCheck

▸ **sanityCheck**(permits: *`number`*): [IO](classes/io.md)<`never`, `void`>

*Defined in [semaphore.ts:26](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/semaphore.ts#L26)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](classes/io.md)<`never`, `void`>

___
<a id="ticketn"></a>

###  ticketN

▸ **ticketN**(sem: *[Semaphore](classes/semaphore.md)*, permits: *`number`*, state: *[Ref](classes/ref.md)<[OneOf](#oneof)<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>>*): [IO](classes/io.md)<`never`, [Ticket](classes/ticket.md)>

*Defined in [semaphore.ts:129](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/semaphore.ts#L129)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| sem | [Semaphore](classes/semaphore.md) |
| permits | `number` |
| state | [Ref](classes/ref.md)<[OneOf](#oneof)<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>> |

**Returns:** [IO](classes/io.md)<`never`, [Ticket](classes/ticket.md)>

___

