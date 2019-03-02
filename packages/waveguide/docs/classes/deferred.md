[waveguide](../README.md) > [Deferred](../classes/deferred.md)

# Class: Deferred

An asynchronous value cell that starts empty and may be filled at most one time.

## Type parameters
#### A 
## Hierarchy

**Deferred**

## Index

### Constructors

* [constructor](deferred.md#constructor)

### Properties

* [isEmpty](deferred.md#isempty)
* [isFull](deferred.md#isfull)
* [oneshot](deferred.md#oneshot)
* [wait](deferred.md#wait)

### Methods

* [fill](deferred.md#fill)
* [alloc](deferred.md#alloc)
* [unsafeAlloc](deferred.md#unsafealloc)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Deferred**(): [Deferred](deferred.md)

*Defined in [deferred.ts:22](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L22)*

**Returns:** [Deferred](deferred.md)

___

## Properties

<a id="isempty"></a>

###  isEmpty

**● isEmpty**: *[IO](io.md)<`never`, `boolean`>*

*Defined in [deferred.ts:21](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L21)*

___
<a id="isfull"></a>

###  isFull

**● isFull**: *[IO](io.md)<`never`, `boolean`>*

*Defined in [deferred.ts:20](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L20)*

___
<a id="oneshot"></a>

### `<Private>` oneshot

**● oneshot**: *[OneShot](oneshot.md)<`A`>*

*Defined in [deferred.ts:22](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L22)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, `A`>*

*Defined in [deferred.ts:19](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L19)*

___

## Methods

<a id="fill"></a>

###  fill

▸ **fill**(a: *`A`*): [IO](io.md)<`never`, `void`>

*Defined in [deferred.ts:52](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L52)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**<`A`>(): [IO](io.md)<`never`, [Deferred](deferred.md)<`A`>>

*Defined in [deferred.ts:11](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L11)*

**Type parameters:**

#### A 

**Returns:** [IO](io.md)<`never`, [Deferred](deferred.md)<`A`>>

___
<a id="unsafealloc"></a>

### `<Static>` unsafeAlloc

▸ **unsafeAlloc**<`A`>(): [Deferred](deferred.md)<`A`>

*Defined in [deferred.ts:15](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/deferred.ts#L15)*

**Type parameters:**

#### A 

**Returns:** [Deferred](deferred.md)<`A`>

___

