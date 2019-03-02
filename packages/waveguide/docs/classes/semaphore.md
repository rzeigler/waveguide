[waveguide](../README.md) > [Semaphore](../classes/semaphore.md)

# Class: Semaphore

Semaphore for IO Based loosely on [https://github.com/scalaz/scalaz-zio/blob/master/core/shared/src/main/scala/scalaz/zio/Semaphore.scala](https://github.com/scalaz/scalaz-zio/blob/master/core/shared/src/main/scala/scalaz/zio/Semaphore.scala)

## Hierarchy

**Semaphore**

## Index

### Constructors

* [constructor](semaphore.md#constructor)

### Properties

* [acquire](semaphore.md#acquire)
* [count](semaphore.md#count)
* [ref](semaphore.md#ref)
* [release](semaphore.md#release)

### Methods

* [acquireN](semaphore.md#acquiren)
* [releaseN](semaphore.md#releasen)
* [withPermit](semaphore.md#withpermit)
* [withPermitsN](semaphore.md#withpermitsn)
* [alloc](semaphore.md#alloc)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new Semaphore**(ref: *[Ref](ref.md)<[State](../#state)>*): [Semaphore](semaphore.md)

*Defined in semaphore.ts:39*

**Parameters:**

| Name | Type |
| ------ | ------ |
| ref | [Ref](ref.md)<[State](../#state)> |

**Returns:** [Semaphore](semaphore.md)

___

## Properties

<a id="acquire"></a>

###  acquire

**● acquire**: *[IO](io.md)<`never`, `void`>* =  this.acquireN(1)

*Defined in semaphore.ts:36*

___
<a id="count"></a>

###  count

**● count**: *[IO](io.md)<`never`, `number`>* =  this.ref.get
    .map(count)

*Defined in semaphore.ts:38*

___
<a id="ref"></a>

### `<Private>` ref

**● ref**: *[Ref](ref.md)<[State](../#state)>*

*Defined in semaphore.ts:41*

___
<a id="release"></a>

###  release

**● release**: *[IO](io.md)<`never`, `void`>* =  this.releaseN(1)

*Defined in semaphore.ts:37*

___

## Methods

<a id="acquiren"></a>

###  acquireN

▸ **acquireN**(permits: *`number`*): [IO](io.md)<`never`, `void`>

*Defined in semaphore.ts:53*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="releasen"></a>

###  releaseN

▸ **releaseN**(permits: *`number`*): [IO](io.md)<`never`, `void`>

*Defined in semaphore.ts:67*

**Parameters:**

| Name | Type |
| ------ | ------ |
| permits | `number` |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="withpermit"></a>

###  withPermit

▸ **withPermit**<`E`,`A`>(io: *[IO](io.md)<`E`, `A`>*): [IO](io.md)<`E`, `A`>

*Defined in semaphore.ts:49*

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

*Defined in semaphore.ts:43*

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

*Defined in semaphore.ts:31*

Create a new semaphore with the given number of permits

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| permits | `number` |  The number of permits the semaphore should start with |

**Returns:** [IO](io.md)<`never`, [Semaphore](semaphore.md)>

___

