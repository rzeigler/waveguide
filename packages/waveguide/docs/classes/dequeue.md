[waveguide](../README.md) > [Dequeue](../classes/dequeue.md)

# Class: Dequeue

## Type parameters
#### A 
## Hierarchy

**Dequeue**

## Index

### Constructors

* [constructor](dequeue.md#constructor)

### Properties

* [array](dequeue.md#array)
* [empty](dequeue.md#empty)
* [length](dequeue.md#length)

### Methods

* [offer](dequeue.md#offer)
* [push](dequeue.md#push)
* [take](dequeue.md#take)
* [ofAll](dequeue.md#ofall)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Dequeue**(array: *`ReadonlyArray`<`A`>*): [Dequeue](dequeue.md)

*Defined in queue.ts:7*

**Parameters:**

| Name | Type |
| ------ | ------ |
| array | `ReadonlyArray`<`A`> |

**Returns:** [Dequeue](dequeue.md)

___

## Properties

<a id="array"></a>

###  array

**● array**: *`ReadonlyArray`<`A`>*

*Defined in queue.ts:10*

___
<a id="empty"></a>

###  empty

**● empty**: *`boolean`*

*Defined in queue.ts:7*

___
<a id="length"></a>

###  length

**● length**: *`number`*

*Defined in queue.ts:6*

___

## Methods

<a id="offer"></a>

###  offer

▸ **offer**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in queue.ts:15*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="push"></a>

###  push

▸ **push**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in queue.ts:19*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="take"></a>

###  take

▸ **take**(): [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

*Defined in queue.ts:23*

**Returns:** [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

___
<a id="ofall"></a>

### `<Static>` ofAll

▸ **ofAll**<`A`>(as: *`ReadonlyArray`<`A`>*): [Dequeue](dequeue.md)<`A`>

*Defined in queue.ts:2*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| as | `ReadonlyArray`<`A`> |

**Returns:** [Dequeue](dequeue.md)<`A`>

___

