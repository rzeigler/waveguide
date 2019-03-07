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

*Defined in [deferred.ts:36](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L36)*

**Returns:** [Deferred](deferred.md)

___

## Properties

<a id="isempty"></a>

###  isEmpty

**● isEmpty**: *[IO](io.md)<`never`, `boolean`>*

*Defined in [deferred.ts:35](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L35)*

___
<a id="isfull"></a>

###  isFull

**● isFull**: *[IO](io.md)<`never`, `boolean`>*

*Defined in [deferred.ts:34](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L34)*

___
<a id="oneshot"></a>

### `<Private>` oneshot

**● oneshot**: *[OneShot](oneshot.md)<`A`>*

*Defined in [deferred.ts:36](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L36)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, `A`>*

*Defined in [deferred.ts:33](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L33)*

___

## Methods

<a id="fill"></a>

###  fill

▸ **fill**(a: *`A`*): [IO](io.md)<`never`, `void`>

*Defined in [deferred.ts:66](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L66)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**<`A`>(): [IO](io.md)<`never`, [Deferred](deferred.md)<`A`>>

*Defined in [deferred.ts:25](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L25)*

**Type parameters:**

#### A 

**Returns:** [IO](io.md)<`never`, [Deferred](deferred.md)<`A`>>

___
<a id="unsafealloc"></a>

### `<Static>` unsafeAlloc

▸ **unsafeAlloc**<`A`>(): [Deferred](deferred.md)<`A`>

*Defined in [deferred.ts:29](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/deferred.ts#L29)*

**Type parameters:**

#### A 

**Returns:** [Deferred](deferred.md)<`A`>

___

