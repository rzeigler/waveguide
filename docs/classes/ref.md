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
* [update](ref.md#update)
* [alloc](ref.md#alloc)
* [unsafeAlloc](ref.md#unsafealloc)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Ref**(a: *`A`*): [Ref](ref.md)

*Defined in [ref.ts:21](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L21)*

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

*Defined in [ref.ts:22](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L22)*

___
<a id="get"></a>

###  get

**● get**: *[IO](io.md)<`never`, `A`>* =  IO.eval(() => this.a)

*Defined in [ref.ts:21](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L21)*

___

## Methods

<a id="modify"></a>

###  modify

▸ **modify**<`B`>(f: *`function`*): [IO](io.md)<`never`, `B`>

*Defined in [ref.ts:35](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L35)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`never`, `B`>

___
<a id="set"></a>

###  set

▸ **set**(a: *`A`*): [IO](io.md)<`never`, `void`>

*Defined in [ref.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L23)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="update"></a>

###  update

▸ **update**(f: *`function`*): [IO](io.md)<`never`, `A`>

*Defined in [ref.ts:28](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L28)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`never`, `A`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**<`A`>(a: *`A`*): [IO](io.md)<`never`, [Ref](ref.md)<`A`>>

*Defined in [ref.ts:13](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L13)*

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

*Defined in [ref.ts:17](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/ref.ts#L17)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Ref](ref.md)<`A`>

___

