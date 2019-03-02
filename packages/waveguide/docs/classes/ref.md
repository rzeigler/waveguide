[waveguide](../README.md) > [Ref](../classes/ref.md)

# Class: Ref

A synchronous mutable reference cell that always contains a value

## Type parameters
#### A 
## Hierarchy

**Ref**

## Index

### Constructors

* [constructor](ref.md#constructor)

### Properties

* [a](ref.md#a)
* [get](ref.md#get)

### Methods

* [modify](ref.md#modify)
* [set](ref.md#set)
* [alloc](ref.md#alloc)
* [unsafeAlloc](ref.md#unsafealloc)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Ref**(a: *`A`*): [Ref](ref.md)

*Defined in [ref.ts:15](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L15)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Ref](ref.md)

___

## Properties

<a id="a"></a>

### `<Private>` a

**● a**: *`A`*

*Defined in [ref.ts:16](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L16)*

___
<a id="get"></a>

###  get

**● get**: *[IO](io.md)<`never`, `A`>* =  IO.eval(() => this.a)

*Defined in [ref.ts:15](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L15)*

___

## Methods

<a id="modify"></a>

###  modify

▸ **modify**(f: *`function`*): [IO](io.md)<`never`, `A`>

*Defined in [ref.ts:22](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L22)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`never`, `A`>

___
<a id="set"></a>

###  set

▸ **set**(a: *`A`*): [IO](io.md)<`never`, `void`>

*Defined in [ref.ts:17](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L17)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**<`A`>(a: *`A`*): [IO](io.md)<`never`, [Ref](ref.md)<`A`>>

*Defined in [ref.ts:7](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L7)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, [Ref](ref.md)<`A`>>

___
<a id="unsafealloc"></a>

### `<Static>` unsafeAlloc

▸ **unsafeAlloc**<`A`>(a: *`A`*): [Ref](ref.md)<`A`>

*Defined in [ref.ts:11](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/ref.ts#L11)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Ref](ref.md)<`A`>

___

