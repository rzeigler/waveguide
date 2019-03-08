
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

`IO<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with a number of typeclass instances for Monoid, Monad, and parallel Applicative. Furthermore, there are a several resource acquisition functions such as `bracket` and `ensuring` which guarantee IO actions happen in the fact of errors or interuption. These respect the 'critical' method which marks an IO as a critical section and as such should be interruptible.

Fibers
------

An `IO<E, A>` may be converted to a fiber using `fork()`. The result being an `IO<never, Fiber<E, A>>`. The IO action is now running in the background and can be interrupted, waited, or joined. `interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in. A fiber will always run its finalizers even in the face of interruption. `join` will halt the progress of the current fiber until the result of the target fiber is known. `wait` will await the termination of a fiber either by interruption or completion. In particular, if you need to know when a fiber has finished its finalizers after being interrupted, you may use `wait`.

Running
-------

IOs are lazy so they don't actually do anything until they are interpreted. `launch` will begin running a fiber and returns a cancellation action. `promised` will return a promise of the result of the fiber and will not resolve in the face of interruption. `promisedResult` will return a promise of a FiberResult.

Concurrency Abstractions
------------------------

Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), Semaphore, and an asynchronous Queue implementation.

## Index

### Modules

* ["fp-ts/lib/HKT"](modules/_fp_ts_lib_hkt_.md)

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
* [ForwardProxy](classes/forwardproxy.md)
* [IO](classes/io.md)
* [InterruptFrame](classes/interruptframe.md)
* [Interrupted](classes/interrupted.md)
* [Mutex](classes/mutex.md)
* [NonBlockingQueue](classes/nonblockingqueue.md)
* [Of](classes/of.md)
* [OnDone](classes/ondone.md)
* [OnInterrupted](classes/oninterrupted.md)
* [OneShot](classes/oneshot.md)
* [Raise](classes/raise.md)
* [Ref](classes/ref.md)
* [Runtime](classes/runtime.md)
* [Semaphore](classes/semaphore.md)
* [Suspend](classes/suspend.md)
* [Terminal](classes/terminal.md)
* [Ticket](classes/ticket.md)
* [Value](classes/value.md)

### Interfaces

* [AsyncQueue](interfaces/asyncqueue.md)
* [Call](interfaces/call.md)
* [FiniteAsyncQueue](interfaces/finiteasyncqueue.md)
* [FiniteNonBlockingState](interfaces/finitenonblockingstate.md)

### Type aliases

* [Attempt](#attempt)
* [Available](#available)
* [Cause](#cause)
* [EnqueueStrategy](#enqueuestrategy)
* [FNBQ](#fnbq)
* [FiberResult](#fiberresult)
* [Frame](#frame)
* [IOStep](#iostep)
* [NBS](#nbs)
* [OverflowStrategy](#overflowstrategy)
* [Reservation](#reservation)
* [Result](#result)
* [State](#state)
* [UIO](#uio)
* [Waiting](#waiting)

### Variables

* [URI](#uri)
* [interrupted](#interrupted)
* [terminal](#terminal)

### Functions

* [append](#append)
* [assert](#assert)
* [boundedNonBlockingQueue](#boundednonblockingqueue)
* [compositeCause](#compositecause)
* [countPermits](#countpermits)
* [createCompositeFinalizer](#createcompositefinalizer)
* [droppingStrategy](#droppingstrategy)
* [equiv](#equiv)
* [equivIO](#equivio)
* [fiberInterrupt](#fiberinterrupt)
* [getMonoid](#getmonoid)
* [getParallelMonoid](#getparallelmonoid)
* [getParallelSemigroup](#getparallelsemigroup)
* [getRaceMonoid](#getracemonoid)
* [getSemigroup](#getsemigroup)
* [isGt](#isgt)
* [isGte](#isgte)
* [isLt](#islt)
* [isLte](#islte)
* [map](#map)
* [of](#of)
* [queueCount](#queuecount)
* [raceInto](#raceinto)
* [sanityCheck](#sanitycheck)
* [slidingStrategy](#slidingstrategy)
* [ticketN](#ticketn)
* [unboundedNonBlockingQueue](#unboundednonblockingqueue)
* [unboundedStrategy](#unboundedstrategy)

### Object literals

* [monad](#monad)
* [parallelApplicative](#parallelapplicative)

---

## Type aliases

<a id="attempt"></a>

###  Attempt

**Ƭ Attempt**: *[Raise](classes/raise.md)<`E`> \| [Value](classes/value.md)<`A`>*

*Defined in [result.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/result.ts#L16)*

___
<a id="available"></a>

###  Available

**Ƭ Available**: *[Dequeue](classes/dequeue.md)<`A`>*

*Defined in [queue.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L38)*

___
<a id="cause"></a>

###  Cause

**Ƭ Cause**: *[Raise](classes/raise.md)<`E`> \| [Abort](classes/abort.md)*

*Defined in [result.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/result.ts#L23)*

___
<a id="enqueuestrategy"></a>

###  EnqueueStrategy

**Ƭ EnqueueStrategy**: *`function`*

*Defined in [queue.ts:48](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L48)*

#### Type declaration
▸(a: *`A`*, current: *[Dequeue](classes/dequeue.md)<`A`>*): [Dequeue](classes/dequeue.md)<`A`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |
| current | [Dequeue](classes/dequeue.md)<`A`> |

**Returns:** [Dequeue](classes/dequeue.md)<`A`>

___
<a id="fnbq"></a>

###  FNBQ

**Ƭ FNBQ**: *`Either`<[Waiting](#waiting)<`Option`<`A`>>, [Available](#available)<`A`>>*

*Defined in [queue.ts:42](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L42)*

___
<a id="fiberresult"></a>

###  FiberResult

**Ƭ FiberResult**: *[Interrupted](classes/interrupted.md) \| [Result](#result)<`E`, `A`>*

*Defined in [result.ts:6](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/result.ts#L6)*

___
<a id="frame"></a>

###  Frame

**Ƭ Frame**: *[ChainFrame](classes/chainframe.md) \| [ErrorFrame](classes/errorframe.md) \| [FinalizeFrame](classes/finalizeframe.md) \| [InterruptFrame](classes/interruptframe.md)*

*Defined in [internal/runtime.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L12)*

___
<a id="iostep"></a>

###  IOStep

**Ƭ IOStep**: *[Of](classes/of.md)<`A`> \| [Failed](classes/failed.md)<`E`> \| [Caused](classes/caused.md)<`E`> \| [Suspend](classes/suspend.md)<`E`, `A`> \| [Async](classes/async.md)<`E`, `A`> \| [Critical](classes/critical.md)<`E`, `A`> \| [Chain](classes/chain.md)<`E`, `any`, `A`> \| [ChainError](classes/chainerror.md)<`E`, `any`, `A`> \| [OnDone](classes/ondone.md)<`E`, `any`, `A`> \| [OnInterrupted](classes/oninterrupted.md)<`E`, `any`, `A`>*

*Defined in [internal/iostep.ts:9](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L9)*

___
<a id="nbs"></a>

###  NBS

**Ƭ NBS**: *`Either`<[Waiting](#waiting)<`A`>, [Available](#available)<`A`>>*

*Defined in [queue.ts:40](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L40)*

___
<a id="overflowstrategy"></a>

###  OverflowStrategy

**Ƭ OverflowStrategy**: *"slide" \| "drop"*

*Defined in [queue.ts:25](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L25)*

___
<a id="reservation"></a>

###  Reservation

**Ƭ Reservation**: *[`number`, [Deferred](classes/deferred.md)<`void`>]*

*Defined in [semaphore.ts:15](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L15)*

___
<a id="result"></a>

###  Result

**Ƭ Result**: *[Cause](#cause)<`E`> \| [Value](classes/value.md)<`A`>*

*Defined in [result.ts:14](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/result.ts#L14)*

___
<a id="state"></a>

###  State

**Ƭ State**: *`Either`<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>*

*Defined in [semaphore.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L16)*

___
<a id="uio"></a>

###  UIO

**Ƭ UIO**: *[IO](classes/io.md)<`never`, `A`>*

*Defined in [io.ts:31](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L31)*

Unexception IO.

A type alias for IO<never, A> which is an IO that cannot fail (though it can abort)

___
<a id="waiting"></a>

###  Waiting

**Ƭ Waiting**: *[Dequeue](classes/dequeue.md)<[Deferred](classes/deferred.md)<`A`>>*

*Defined in [queue.ts:39](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L39)*

___

## Variables

<a id="uri"></a>

### `<Const>` URI

**● URI**: *"IO"* = "IO"

*Defined in [instances.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L12)*
*Defined in [instances.ts:13](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L13)*

___
<a id="interrupted"></a>

### `<Const>` interrupted

**● interrupted**: *[Interrupted](classes/interrupted.md)* =  new Interrupted()

*Defined in [result.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/result.ts#L12)*

___
<a id="terminal"></a>

### `<Const>` terminal

**● terminal**: *[Terminal](classes/terminal.md)* =  new Terminal()

*Defined in [terminal.ts:22](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/terminal.ts#L22)*

___

## Functions

<a id="append"></a>

### `<Const>` append

▸ **append**<`A`>(a: *`A`*): `(Anonymous function)`

*Defined in [__test__/queue.spec.ts:15](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/__test__/queue.spec.ts#L15)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** `(Anonymous function)`

___
<a id="assert"></a>

###  assert

▸ **assert**<`A`>(a: *`A`*, prop: *`function`*, msg: *`string`*): [IO](classes/io.md)<`never`, `void`>

*Defined in [internal/assert.ts:9](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/assert.ts#L9)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |
| prop | `function` |
| msg | `string` |

**Returns:** [IO](classes/io.md)<`never`, `void`>

___
<a id="boundednonblockingqueue"></a>

###  boundedNonBlockingQueue

▸ **boundedNonBlockingQueue**<`A`>(max: *`number`*, strategy: *[OverflowStrategy](#overflowstrategy)*): [IO](classes/io.md)<`never`, [AsyncQueue](interfaces/asyncqueue.md)<`A`>>

*Defined in [queue.ts:32](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L32)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| max | `number` |
| strategy | [OverflowStrategy](#overflowstrategy) |

**Returns:** [IO](classes/io.md)<`never`, [AsyncQueue](interfaces/asyncqueue.md)<`A`>>

___
<a id="compositecause"></a>

### `<Const>` compositeCause

▸ **compositeCause**(base: *[Cause](#cause)<`unknown`>*): `(Anonymous function)`

*Defined in [internal/runtime.ts:351](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L351)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| base | [Cause](#cause)<`unknown`> |

**Returns:** `(Anonymous function)`

___
<a id="countpermits"></a>

###  countPermits

▸ **countPermits**(state: *[State](#state)*): `number`

*Defined in [semaphore.ts:102](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L102)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | [State](#state) |

**Returns:** `number`

___
<a id="createcompositefinalizer"></a>

###  createCompositeFinalizer

▸ **createCompositeFinalizer**(cause: *[Cause](#cause)<`unknown`>*, finalizers: *[FinalizeFrame](classes/finalizeframe.md)[]*): [IO](classes/io.md)<`unknown`, `unknown`>

*Defined in [internal/runtime.ts:343](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L343)*

Create a single composite uninterruptible finalizer

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| cause | [Cause](#cause)<`unknown`> |  The initial cause to rethrow |
| finalizers | [FinalizeFrame](classes/finalizeframe.md)[] |

**Returns:** [IO](classes/io.md)<`unknown`, `unknown`>
and IO action that executes all of the finalizers

___
<a id="droppingstrategy"></a>

### `<Const>` droppingStrategy

▸ **droppingStrategy**(max: *`number`*): `(Anonymous function)`

*Defined in [queue.ts:53](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L53)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| max | `number` |

**Returns:** `(Anonymous function)`

___
<a id="equiv"></a>

###  equiv

▸ **equiv**<`E`,`A`>(io: *[IO](classes/io.md)<`E`, `A`>*, result: *[Result](#result)<`E`, `A`>*): `Promise`<`void`>

*Defined in [__test__/lib.spec.ts:10](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/__test__/lib.spec.ts#L10)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](classes/io.md)<`E`, `A`> |
| result | [Result](#result)<`E`, `A`> |

**Returns:** `Promise`<`void`>

___
<a id="equivio"></a>

###  equivIO

▸ **equivIO**<`E`,`A`>(io: *[IO](classes/io.md)<`E`, `A`>*, io2: *[IO](classes/io.md)<`E`, `A`>*): `Promise`<`void`>

*Defined in [__test__/lib.spec.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/__test__/lib.spec.ts#L16)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](classes/io.md)<`E`, `A`> |
| io2 | [IO](classes/io.md)<`E`, `A`> |

**Returns:** `Promise`<`void`>

___
<a id="fiberinterrupt"></a>

###  fiberInterrupt

▸ **fiberInterrupt**<`E`,`A`>(fiber: *[Fiber](classes/fiber.md)<`E`, `A`>*): [IO](classes/io.md)<`never`, `void`>

*Defined in [io.ts:662](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L662)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fiber | [Fiber](classes/fiber.md)<`E`, `A`> |

**Returns:** [IO](classes/io.md)<`never`, `void`>

___
<a id="getmonoid"></a>

###  getMonoid

▸ **getMonoid**<`L`,`A`>(M: *`Monoid`<`A`>*): `Monoid`<[IO](classes/io.md)<`L`, `A`>>

*Defined in [instances.ts:80](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L80)*

Get a monoid for IO<E, A> given a monoid for A that runs in sequence

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| M | `Monoid`<`A`> |   |

**Returns:** `Monoid`<[IO](classes/io.md)<`L`, `A`>>

___
<a id="getparallelmonoid"></a>

###  getParallelMonoid

▸ **getParallelMonoid**<`L`,`A`>(M: *`Monoid`<`A`>*): `Monoid`<[IO](classes/io.md)<`L`, `A`>>

*Defined in [instances.ts:91](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L91)*

Get a monoid for IO<E, A> given a monoid for A that runs in sequence

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| M | `Monoid`<`A`> |   |

**Returns:** `Monoid`<[IO](classes/io.md)<`L`, `A`>>

___
<a id="getparallelsemigroup"></a>

###  getParallelSemigroup

▸ **getParallelSemigroup**<`L`,`A`>(S: *`Semigroup`<`A`>*): `Semigroup`<[IO](classes/io.md)<`L`, `A`>>

*Defined in [instances.ts:70](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L70)*

Get a semigroup for IO<E, A> given a semigroup for A that runs in parallel

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| S | `Semigroup`<`A`> |   |

**Returns:** `Semigroup`<[IO](classes/io.md)<`L`, `A`>>

___
<a id="getracemonoid"></a>

###  getRaceMonoid

▸ **getRaceMonoid**<`L`,`A`>(): `Monoid`<[IO](classes/io.md)<`L`, `A`>>

*Defined in [instances.ts:49](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L49)*

Get a monoid for IO<E, A> that combines actions by racing them.

**Type parameters:**

#### L 
#### A 

**Returns:** `Monoid`<[IO](classes/io.md)<`L`, `A`>>

___
<a id="getsemigroup"></a>

###  getSemigroup

▸ **getSemigroup**<`L`,`A`>(S: *`Semigroup`<`A`>*): `Semigroup`<[IO](classes/io.md)<`L`, `A`>>

*Defined in [instances.ts:60](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L60)*

Get a semigroup for IO<E, A> given a semigroup for A.

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| S | `Semigroup`<`A`> |   |

**Returns:** `Semigroup`<[IO](classes/io.md)<`L`, `A`>>

___
<a id="isgt"></a>

###  isGt

▸ **isGt**(max: *`number`*): `function`

*Defined in [internal/assert.ts:20](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/assert.ts#L20)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| max | `number` |

**Returns:** `function`

___
<a id="isgte"></a>

###  isGte

▸ **isGte**(max: *`number`*): `function`

*Defined in [internal/assert.ts:28](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/assert.ts#L28)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| max | `number` |

**Returns:** `function`

___
<a id="islt"></a>

###  isLt

▸ **isLt**(min: *`number`*): `function`

*Defined in [internal/assert.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/assert.ts#L16)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| min | `number` |

**Returns:** `function`

___
<a id="islte"></a>

###  isLte

▸ **isLte**(min: *`number`*): `function`

*Defined in [internal/assert.ts:24](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/assert.ts#L24)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| min | `number` |

**Returns:** `function`

___
<a id="map"></a>

### `<Const>` map

▸ **map**<`L`,`A`,`B`>(fa: *[IO](classes/io.md)<`L`, `A`>*, f: *`function`*): [IO](classes/io.md)<`L`, `B`>

*Defined in [instances.ts:21](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L21)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fa | [IO](classes/io.md)<`L`, `A`> |
| f | `function` |

**Returns:** [IO](classes/io.md)<`L`, `B`>

___
<a id="of"></a>

### `<Const>` of

▸ **of**<`L`,`A`>(a: *`A`*): [IO](classes/io.md)<`L`, `A`>

*Defined in [instances.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L23)*

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](classes/io.md)<`L`, `A`>

___
<a id="queuecount"></a>

###  queueCount

▸ **queueCount**<`A`>(state: *`Either`<[Dequeue](classes/dequeue.md)<`unknown`>, [Dequeue](classes/dequeue.md)<`unknown`>>*): `number`

*Defined in [queue.ts:114](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L114)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| state | `Either`<[Dequeue](classes/dequeue.md)<`unknown`>, [Dequeue](classes/dequeue.md)<`unknown`>> |

**Returns:** `number`

___
<a id="raceinto"></a>

###  raceInto

▸ **raceInto**<`E`,`A`>(defer: *[Deferred](classes/deferred.md)<[Result](#result)<`E`, `A`>>*, io: *[IO](classes/io.md)<`E`, `A`>*): [IO](classes/io.md)<`never`, [Fiber](classes/fiber.md)<`never`, `void`>>

*Defined in [io.ts:654](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L654)*

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

*Defined in [semaphore.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](classes/io.md)<`never`, `void`>

___
<a id="slidingstrategy"></a>

### `<Const>` slidingStrategy

▸ **slidingStrategy**(max: *`number`*): `(Anonymous function)`

*Defined in [queue.ts:56](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L56)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| max | `number` |

**Returns:** `(Anonymous function)`

___
<a id="ticketn"></a>

###  ticketN

▸ **ticketN**(sem: *[Semaphore](classes/semaphore.md)*, permits: *`number`*, state: *[Ref](classes/ref.md)<`Either`<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>>*): [IO](classes/io.md)<`never`, [Ticket](classes/ticket.md)<`void`>>

*Defined in [semaphore.ts:110](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L110)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| sem | [Semaphore](classes/semaphore.md) |
| permits | `number` |
| state | [Ref](classes/ref.md)<`Either`<[Dequeue](classes/dequeue.md)<[Reservation](#reservation)>, `number`>> |

**Returns:** [IO](classes/io.md)<`never`, [Ticket](classes/ticket.md)<`void`>>

___
<a id="unboundednonblockingqueue"></a>

###  unboundedNonBlockingQueue

▸ **unboundedNonBlockingQueue**<`A`>(): [IO](classes/io.md)<`never`, [AsyncQueue](interfaces/asyncqueue.md)<`A`>>

*Defined in [queue.ts:27](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L27)*

**Type parameters:**

#### A 

**Returns:** [IO](classes/io.md)<`never`, [AsyncQueue](interfaces/asyncqueue.md)<`A`>>

___
<a id="unboundedstrategy"></a>

### `<Const>` unboundedStrategy

▸ **unboundedStrategy**<`A`>(a: *`A`*, current: *[Dequeue](classes/dequeue.md)<`A`>*): [Dequeue](classes/dequeue.md)<`A`>

*Defined in [queue.ts:50](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L50)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |
| current | [Dequeue](classes/dequeue.md)<`A`> |

**Returns:** [Dequeue](classes/dequeue.md)<`A`>

___

## Object literals

<a id="monad"></a>

### `<Const>` monad

**monad**: *`object`*

*Defined in [instances.ts:28](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L28)*

Get the Monad instance for an IO<E, A>

<a id="monad.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [instances.ts:29](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L29)*

___
<a id="monad.map"></a>

####  map

**● map**: *[map]()*

*Defined in [instances.ts:30](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L30)*

___
<a id="monad.of"></a>

####  of

**● of**: *[of]()*

*Defined in [instances.ts:31](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L31)*

___
<a id="monad.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *[IO](classes/io.md)<`L`, `function`>*, fa: *[IO](classes/io.md)<`L`, `A`>*): [IO](classes/io.md)<`L`, `B`>

*Defined in [instances.ts:32](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L32)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fab | [IO](classes/io.md)<`L`, `function`> |
| fa | [IO](classes/io.md)<`L`, `A`> |

**Returns:** [IO](classes/io.md)<`L`, `B`>

___
<a id="monad.chain"></a>

####  chain

▸ **chain**<`L`,`A`,`B`>(fa: *[IO](classes/io.md)<`L`, `A`>*, f: *`function`*): [IO](classes/io.md)<`L`, `B`>

*Defined in [instances.ts:33](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L33)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fa | [IO](classes/io.md)<`L`, `A`> |
| f | `function` |

**Returns:** [IO](classes/io.md)<`L`, `B`>

___

___
<a id="parallelapplicative"></a>

### `<Const>` parallelApplicative

**parallelApplicative**: *`object`*

*Defined in [instances.ts:39](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L39)*

Get a parallel applicative instance for IO<E, A>

<a id="parallelapplicative.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [instances.ts:40](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L40)*

___
<a id="parallelapplicative.map"></a>

####  map

**● map**: *[map]()*

*Defined in [instances.ts:41](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L41)*

___
<a id="parallelapplicative.of"></a>

####  of

**● of**: *[of]()*

*Defined in [instances.ts:42](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L42)*

___
<a id="parallelapplicative.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *[IO](classes/io.md)<`L`, `function`>*, fa: *[IO](classes/io.md)<`L`, `A`>*): [IO](classes/io.md)<`L`, `B`>

*Defined in [instances.ts:43](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/instances.ts#L43)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fab | [IO](classes/io.md)<`L`, `function`> |
| fa | [IO](classes/io.md)<`L`, `A`> |

**Returns:** [IO](classes/io.md)<`L`, `B`>

___

___

