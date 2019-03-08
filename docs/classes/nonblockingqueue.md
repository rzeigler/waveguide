[waveguide](../README.md) > [NonBlockingQueue](../classes/nonblockingqueue.md)

# Class: NonBlockingQueue

## Type parameters
#### A 
## Hierarchy

**NonBlockingQueue**

## Implements

* [AsyncQueue](../interfaces/asyncqueue.md)<`A`>

## Index

### Constructors

* [constructor](nonblockingqueue.md#constructor)

### Properties

* [count](nonblockingqueue.md#count)
* [enqueue](nonblockingqueue.md#enqueue)
* [state](nonblockingqueue.md#state)
* [take](nonblockingqueue.md#take)

### Methods

* [offer](nonblockingqueue.md#offer)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new NonBlockingQueue**(state: *[Ref](ref.md)<[NBS](../#nbs)<`A`>>*, enqueue: *[EnqueueStrategy](../#enqueuestrategy)<`A`>*): [NonBlockingQueue](nonblockingqueue.md)

*Defined in [queue.ts:66](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L66)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | [Ref](ref.md)<[NBS](../#nbs)<`A`>> |
| enqueue | [EnqueueStrategy](../#enqueuestrategy)<`A`> |

**Returns:** [NonBlockingQueue](nonblockingqueue.md)

___

## Properties

<a id="count"></a>

###  count

**● count**: *[IO](io.md)<`never`, `number`>*

*Implementation of [AsyncQueue](../interfaces/asyncqueue.md).[count](../interfaces/asyncqueue.md#count)*

*Defined in [queue.ts:65](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L65)*

___
<a id="enqueue"></a>

### `<Private>` enqueue

**● enqueue**: *[EnqueueStrategy](../#enqueuestrategy)<`A`>*

*Defined in [queue.ts:68](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L68)*

___
<a id="state"></a>

### `<Private>` state

**● state**: *[Ref](ref.md)<[NBS](../#nbs)<`A`>>*

*Defined in [queue.ts:68](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L68)*

___
<a id="take"></a>

###  take

**● take**: *[IO](io.md)<`never`, `A`>*

*Implementation of [AsyncQueue](../interfaces/asyncqueue.md).[take](../interfaces/asyncqueue.md#take)*

*Defined in [queue.ts:66](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L66)*

___

## Methods

<a id="offer"></a>

###  offer

▸ **offer**(a: *`A`*): [IO](io.md)<`never`, `void`>

*Implementation of [AsyncQueue](../interfaces/asyncqueue.md).[offer](../interfaces/asyncqueue.md#offer)*

*Defined in [queue.ts:97](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L97)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___

