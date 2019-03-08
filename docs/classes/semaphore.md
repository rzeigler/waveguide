[waveguide](../README.md) > [Semaphore](../classes/semaphore.md)

# Class: Semaphore

Semaphore for IO

## Hierarchy

**Semaphore**

## Index

### Constructors

* [constructor](semaphore.md#constructor)

### Properties

* [acquire](semaphore.md#acquire)
* [count](semaphore.md#count)
* [release](semaphore.md#release)
* [state](semaphore.md#state)

### Methods

* [acquireN](semaphore.md#acquiren)
* [releaseN](semaphore.md#releasen)
* [withPermit](semaphore.md#withpermit)
* [withPermitsN](semaphore.md#withpermitsn)
* [alloc](semaphore.md#alloc)
* [unsafeAlloc](semaphore.md#unsafealloc)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Semaphore**(state: *[Ref](ref.md)<[State](../#state)>*): [Semaphore](semaphore.md)

*Defined in [semaphore.ts:53](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L53)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| state | [Ref](ref.md)<[State](../#state)> |

**Returns:** [Semaphore](semaphore.md)

___

## Properties

<a id="acquire"></a>

###  acquire

**● acquire**: *[IO](io.md)<`never`, `void`>* =  this.acquireN(1)

*Defined in [semaphore.ts:50](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L50)*

___
<a id="count"></a>

###  count

**● count**: *[IO](io.md)<`never`, `number`>* =  this.state.get
    .map(countPermits)

*Defined in [semaphore.ts:52](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L52)*

___
<a id="release"></a>

###  release

**● release**: *[IO](io.md)<`never`, `void`>* =  this.releaseN(1)

*Defined in [semaphore.ts:51](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L51)*

___
<a id="state"></a>

### `<Private>` state

**● state**: *[Ref](ref.md)<[State](../#state)>*

*Defined in [semaphore.ts:55](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L55)*

___

## Methods

<a id="acquiren"></a>

###  acquireN

▸ **acquireN**(permits: *`number`*): [IO](io.md)<`never`, `void`>

*Defined in [semaphore.ts:67](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L67)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="releasen"></a>

###  releaseN

▸ **releaseN**(permits: *`number`*): [IO](io.md)<`never`, `void`>

*Defined in [semaphore.ts:72](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L72)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="withpermit"></a>

###  withPermit

▸ **withPermit**<`E`,`A`>(io: *[IO](io.md)<`E`, `A`>*): [IO](io.md)<`E`, `A`>

*Defined in [semaphore.ts:63](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L63)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`E`, `A`> |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="withpermitsn"></a>

###  withPermitsN

▸ **withPermitsN**<`E`,`A`>(permits: *`number`*, io: *[IO](io.md)<`E`, `A`>*): [IO](io.md)<`E`, `A`>

*Defined in [semaphore.ts:57](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L57)*

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |
| io | [IO](io.md)<`E`, `A`> |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="alloc"></a>

### `<Static>` alloc

▸ **alloc**(permits: *`number`*): [IO](io.md)<`never`, [Semaphore](semaphore.md)>

*Defined in [semaphore.ts:35](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L35)*

Create a new semaphore with the given number of permits

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| permits | `number` |  The number of permits the semaphore should start with |

**Returns:** [IO](io.md)<`never`, [Semaphore](semaphore.md)>

___
<a id="unsafealloc"></a>

### `<Static>` unsafeAlloc

▸ **unsafeAlloc**(permits: *`number`*): [Semaphore](semaphore.md)

*Defined in [semaphore.ts:40](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/semaphore.ts#L40)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [Semaphore](semaphore.md)

___

