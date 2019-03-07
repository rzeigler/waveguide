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

*Defined in [ref.ts:29](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L29)*

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

*Defined in [ref.ts:30](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L30)*

___
<a id="get"></a>

###  get

**● get**: *[IO](io.md)<`never`, `A`>* =  IO.eval(() => this.a)

*Defined in [ref.ts:29](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L29)*

___

## Methods

<a id="modify"></a>

###  modify

▸ **modify**<`B`>(f: *`function`*): [IO](io.md)<`never`, `B`>

*Defined in [ref.ts:43](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L43)*

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

*Defined in [ref.ts:31](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L31)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="update"></a>

###  update

▸ **update**(f: *`function`*): [IO](io.md)<`never`, `A`>

*Defined in [ref.ts:36](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L36)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`never`, `A`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**<`A`>(a: *`A`*): [IO](io.md)<`never`, [Ref](ref.md)<`A`>>

*Defined in [ref.ts:21](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L21)*

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

*Defined in [ref.ts:25](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/ref.ts#L25)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [Ref](ref.md)<`A`>

___

