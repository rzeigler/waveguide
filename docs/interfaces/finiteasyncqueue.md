[waveguide](../README.md) > [FiniteAsyncQueue](../interfaces/finiteasyncqueue.md)

# Interface: FiniteAsyncQueue

## Type parameters
#### A 
## Hierarchy

 [AsyncQueue](asyncqueue.md)<`Option`<`A`>>

**↳ FiniteAsyncQueue**

## Index

### Properties

* [close](finiteasyncqueue.md#close)
* [count](finiteasyncqueue.md#count)
* [take](finiteasyncqueue.md#take)

### Methods

* [offer](finiteasyncqueue.md#offer)

---

## Properties

<a id="close"></a>

###  close

**● close**: *[IO](../classes/io.md)<`never`, `void`>*

*Defined in [queue.ts:22](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L22)*

___
<a id="count"></a>

###  count

**● count**: *[IO](../classes/io.md)<`never`, `number`>*

*Inherited from [AsyncQueue](asyncqueue.md).[count](asyncqueue.md#count)*

*Defined in [queue.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L16)*

___
<a id="take"></a>

###  take

**● take**: *[IO](../classes/io.md)<`never`, `Option`<`A`>>*

*Inherited from [AsyncQueue](asyncqueue.md).[take](asyncqueue.md#take)*

*Defined in [queue.ts:17](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L17)*

___

## Methods

<a id="offer"></a>

###  offer

▸ **offer**(a: *`Option`<`A`>*): [IO](../classes/io.md)<`never`, `void`>

*Inherited from [AsyncQueue](asyncqueue.md).[offer](asyncqueue.md#offer)*

*Defined in [queue.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/queue.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `Option`<`A`> |

**Returns:** [IO](../classes/io.md)<`never`, `void`>

___

