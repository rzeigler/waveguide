[waveguide](../README.md) > [AsyncQueue](../interfaces/asyncqueue.md)

# Interface: AsyncQueue

## Type parameters
#### A 
## Hierarchy

**AsyncQueue**

↳  [FiniteAsyncQueue](finiteasyncqueue.md)

## Implemented by

* [NonBlockingQueue](../classes/nonblockingqueue.md)

## Index

### Properties

* [count](asyncqueue.md#count)
* [take](asyncqueue.md#take)

### Methods

* [offer](asyncqueue.md#offer)

---

## Properties

<a id="count"></a>

###  count

**● count**: *[IO](../classes/io.md)<`never`, `number`>*

*Defined in [queue.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L16)*

___
<a id="take"></a>

###  take

**● take**: *[IO](../classes/io.md)<`never`, `A`>*

*Defined in [queue.ts:17](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L17)*

___

## Methods

<a id="offer"></a>

###  offer

▸ **offer**(a: *`A`*): [IO](../classes/io.md)<`never`, `void`>

*Defined in [queue.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](../classes/io.md)<`never`, `void`>

___

