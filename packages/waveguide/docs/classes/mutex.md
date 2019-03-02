[waveguide](../README.md) > [Mutex](../classes/mutex.md)

# Class: Mutex

## Hierarchy

**Mutex**

## Index

### Constructors

* [constructor](mutex.md#constructor)

### Properties

* [acquire](mutex.md#acquire)
* [release](mutex.md#release)
* [sem](mutex.md#sem)

### Methods

* [alloc](mutex.md#alloc)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Mutex**(sem: *[Semaphore](semaphore.md)*): [Mutex](mutex.md)

*Defined in [mutex.ts:10](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/mutex.ts#L10)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| sem | [Semaphore](semaphore.md) |

**Returns:** [Mutex](mutex.md)

___

## Properties

<a id="acquire"></a>

###  acquire

**● acquire**: *[IO](io.md)<`never`, `void`>*

*Defined in [mutex.ts:9](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/mutex.ts#L9)*

___
<a id="release"></a>

###  release

**● release**: *[IO](io.md)<`never`, `void`>*

*Defined in [mutex.ts:10](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/mutex.ts#L10)*

___
<a id="sem"></a>

### `<Private>` sem

**● sem**: *[Semaphore](semaphore.md)*

*Defined in [mutex.ts:12](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/mutex.ts#L12)*

___

## Methods

<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**(): [IO](io.md)<`never`, [Mutex](mutex.md)>

*Defined in [mutex.ts:5](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/mutex.ts#L5)*

**Returns:** [IO](io.md)<`never`, [Mutex](mutex.md)>

___

