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

* [dequeue](dequeue.md#dequeue-1)
* [enqueue](dequeue.md#enqueue)
* [enqueueFront](dequeue.md#enqueuefront)
* [empty](dequeue.md#empty-1)
* [of](dequeue.md#of)
* [ofAll](dequeue.md#ofall)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Dequeue**(array: *`ReadonlyArray`<`A`>*): [Dequeue](dequeue.md)

*Defined in [queue.ts:29](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L29)*

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

*Defined in [queue.ts:32](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L32)*

___
<a id="empty"></a>

###  empty

**● empty**: *`boolean`*

*Defined in [queue.ts:29](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L29)*

___
<a id="length"></a>

###  length

**● length**: *`number`*

*Defined in [queue.ts:28](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L28)*

___

## Methods

<a id="dequeue-1"></a>

###  dequeue

▸ **dequeue**(): [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

*Defined in [queue.ts:45](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L45)*

**Returns:** [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

___
<a id="enqueue"></a>

###  enqueue

▸ **enqueue**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [queue.ts:37](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L37)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="enqueuefront"></a>

###  enqueueFront

▸ **enqueueFront**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [queue.ts:41](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L41)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="empty-1"></a>

### `<Static>` empty

▸ **empty**<`A`>(): [Dequeue](dequeue.md)<`A`>

*Defined in [queue.ts:24](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L24)*

**Type parameters:**

#### A 

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="of"></a>

### `<Static>` of

▸ **of**<`A`>(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [queue.ts:20](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L20)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="ofall"></a>

### `<Static>` ofAll

▸ **ofAll**<`A`>(as: *`ReadonlyArray`<`A`>*): [Dequeue](dequeue.md)<`A`>

*Defined in [queue.ts:16](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/queue.ts#L16)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| as | `ReadonlyArray`<`A`> |

**Returns:** [Dequeue](dequeue.md)<`A`>

___

