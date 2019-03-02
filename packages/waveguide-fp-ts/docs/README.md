
waveguide-fp-ts
===============

[![npm version](https://badge.fury.io/js/waveguide-fp-ts.svg)](https://badge.fury.io/js/waveguide-fp-ts)

\[fp-ts\] typeclass instances for IO. See the [docs](./docs/readme.md)

Contains Monad2, Applicative2 (for parallelization), Monoid (racing semantics), and Monoid/Semigroup <IO<E, A>> given Monoid/Semigroup in both sequential and parallel varieties.

## Index

### Modules

* ["fp-ts/lib/HKT"](modules/_fp_ts_lib_hkt_.md)

### Variables

* [URI](#uri)

### Functions

* [getMonoid](#getmonoid)
* [getParallelMonoid](#getparallelmonoid)
* [getParallelSemigroup](#getparallelsemigroup)
* [getRaceMonoid](#getracemonoid)
* [getSemigroup](#getsemigroup)
* [map](#map)
* [of](#of)

### Object literals

* [monad](#monad)
* [parallelApplicative](#parallelapplicative)

---

## Variables

<a id="uri"></a>

### `<Const>` URI

**● URI**: *"IO"* = "IO"

*Defined in [index.ts:8](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L8)*
*Defined in [index.ts:9](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L9)*

___

## Functions

<a id="getmonoid"></a>

###  getMonoid

▸ **getMonoid**<`L`,`A`>(M: *`Monoid`<`A`>*): `Monoid`<`IO`<`L`, `A`>>

*Defined in [index.ts:76](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L76)*

Get a monoid for IO<E, A> given a monoid for A that runs in sequence

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| M | `Monoid`<`A`> |   |

**Returns:** `Monoid`<`IO`<`L`, `A`>>

___
<a id="getparallelmonoid"></a>

###  getParallelMonoid

▸ **getParallelMonoid**<`L`,`A`>(M: *`Monoid`<`A`>*): `Monoid`<`IO`<`L`, `A`>>

*Defined in [index.ts:87](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L87)*

Get a monoid for IO<E, A> given a monoid for A that runs in sequence

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| M | `Monoid`<`A`> |   |

**Returns:** `Monoid`<`IO`<`L`, `A`>>

___
<a id="getparallelsemigroup"></a>

###  getParallelSemigroup

▸ **getParallelSemigroup**<`L`,`A`>(S: *`Semigroup`<`A`>*): `Semigroup`<`IO`<`L`, `A`>>

*Defined in [index.ts:66](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L66)*

Get a semigroup for IO<E, A> given a semigroup for A that runs in parallel

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| S | `Semigroup`<`A`> |   |

**Returns:** `Semigroup`<`IO`<`L`, `A`>>

___
<a id="getracemonoid"></a>

###  getRaceMonoid

▸ **getRaceMonoid**<`L`,`A`>(): `Monoid`<`IO`<`L`, `A`>>

*Defined in [index.ts:45](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L45)*

Get a monoid for IO<E, A> that combines actions by racing them.

**Type parameters:**

#### L 
#### A 

**Returns:** `Monoid`<`IO`<`L`, `A`>>

___
<a id="getsemigroup"></a>

###  getSemigroup

▸ **getSemigroup**<`L`,`A`>(S: *`Semigroup`<`A`>*): `Semigroup`<`IO`<`L`, `A`>>

*Defined in [index.ts:56](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L56)*

Get a semigroup for IO<E, A> given a semigroup for A.

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| S | `Semigroup`<`A`> |   |

**Returns:** `Semigroup`<`IO`<`L`, `A`>>

___
<a id="map"></a>

### `<Const>` map

▸ **map**<`L`,`A`,`B`>(fa: *`IO`<`L`, `A`>*, f: *`function`*): `IO`<`L`, `B`>

*Defined in [index.ts:17](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L17)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fa | `IO`<`L`, `A`> |
| f | `function` |

**Returns:** `IO`<`L`, `B`>

___
<a id="of"></a>

### `<Const>` of

▸ **of**<`L`,`A`>(a: *`A`*): `IO`<`L`, `A`>

*Defined in [index.ts:19](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L19)*

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** `IO`<`L`, `A`>

___

## Object literals

<a id="monad"></a>

### `<Const>` monad

**monad**: *`object`*

*Defined in [index.ts:24](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L24)*

Get the Monad instance for an IO<E, A>

<a id="monad.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [index.ts:25](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L25)*

___
<a id="monad.map"></a>

####  map

**● map**: *[map]()*

*Defined in [index.ts:26](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L26)*

___
<a id="monad.of"></a>

####  of

**● of**: *[of]()*

*Defined in [index.ts:27](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L27)*

___
<a id="monad.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *`IO`<`L`, `function`>*, fa: *`IO`<`L`, `A`>*): `IO`<`L`, `B`>

*Defined in [index.ts:28](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L28)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fab | `IO`<`L`, `function`> |
| fa | `IO`<`L`, `A`> |

**Returns:** `IO`<`L`, `B`>

___
<a id="monad.chain"></a>

####  chain

▸ **chain**<`L`,`A`,`B`>(fa: *`IO`<`L`, `A`>*, f: *`function`*): `IO`<`L`, `B`>

*Defined in [index.ts:29](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L29)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fa | `IO`<`L`, `A`> |
| f | `function` |

**Returns:** `IO`<`L`, `B`>

___

___
<a id="parallelapplicative"></a>

### `<Const>` parallelApplicative

**parallelApplicative**: *`object`*

*Defined in [index.ts:35](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L35)*

Get a parallel applicative instance for IO<E, A>

<a id="parallelapplicative.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [index.ts:36](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L36)*

___
<a id="parallelapplicative.map"></a>

####  map

**● map**: *[map]()*

*Defined in [index.ts:37](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L37)*

___
<a id="parallelapplicative.of"></a>

####  of

**● of**: *[of]()*

*Defined in [index.ts:38](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L38)*

___
<a id="parallelapplicative.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *`IO`<`L`, `function`>*, fa: *`IO`<`L`, `A`>*): `IO`<`L`, `B`>

*Defined in [index.ts:39](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide-fp-ts/src/index.ts#L39)*

**Type parameters:**

#### L 
#### A 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fab | `IO`<`L`, `function`> |
| fa | `IO`<`L`, `A`> |

**Returns:** `IO`<`L`, `B`>

___

___

