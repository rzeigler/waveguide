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

⊕ **new Dequeue**(array: *`A`[]*): [Dequeue](dequeue.md)

*Defined in [internal/dequeue.ts:21](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L21)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| array | `A`[] |

**Returns:** [Dequeue](dequeue.md)

___

## Properties

<a id="array"></a>

###  array

**● array**: *`A`[]*

*Defined in [internal/dequeue.ts:24](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L24)*

___
<a id="empty"></a>

###  empty

**● empty**: *`boolean`*

*Defined in [internal/dequeue.ts:21](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L21)*

___
<a id="length"></a>

###  length

**● length**: *`number`*

*Defined in [internal/dequeue.ts:20](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L20)*

___

## Methods

<a id="dequeue-1"></a>

###  dequeue

▸ **dequeue**(): [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

*Defined in [internal/dequeue.ts:37](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L37)*

**Returns:** [`A` \| `undefined`, [Dequeue](dequeue.md)<`A`>]

___
<a id="enqueue"></a>

###  enqueue

▸ **enqueue**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [internal/dequeue.ts:29](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L29)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="enqueuefront"></a>

###  enqueueFront

▸ **enqueueFront**(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [internal/dequeue.ts:33](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L33)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="empty-1"></a>

### `<Static>` empty

▸ **empty**<`A`>(): [Dequeue](dequeue.md)<`A`>

*Defined in [internal/dequeue.ts:16](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L16)*

**Type parameters:**

#### A 

**Returns:** [Dequeue](dequeue.md)<`A`>

___
<a id="of"></a>

### `<Static>` of

▸ **of**<`A`>(a: *`A`*): [Dequeue](dequeue.md)<`A`>

*Defined in [internal/dequeue.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L12)*

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

▸ **ofAll**<`A`>(as: *`A`[]*): [Dequeue](dequeue.md)<`A`>

*Defined in [internal/dequeue.ts:8](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/dequeue.ts#L8)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| as | `A`[] |

**Returns:** [Dequeue](dequeue.md)<`A`>

___

