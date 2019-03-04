
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

* [fromOneOf](#fromoneof)
* [getMonoid](#getmonoid)
* [getParallelMonoid](#getparallelmonoid)
* [getParallelSemigroup](#getparallelsemigroup)
* [getRaceMonoid](#getracemonoid)
* [getSemigroup](#getsemigroup)
* [map](#map)
* [of](#of)
* [optionally](#optionally)

### Object literals

* [monad](#monad)
* [parallelApplicative](#parallelapplicative)

---

## Variables

<a id="uri"></a>

### `<Const>` URI

**● URI**: *"IO"* = "IO"

*Defined in [index.ts:22](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L22)*
*Defined in [index.ts:23](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L23)*

___

## Functions

<a id="fromoneof"></a>

###  fromOneOf

▸ **fromOneOf**<`E`,`A`>(oneOf: *`OneOf`<`E`, `A`>*): `Either`<`E`, `A`>

*Defined in [index.ts:125](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L125)*

Convert a OneOf into an Either.

First -> Left, Second -> Right.

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| oneOf | `OneOf`<`E`, `A`> |   |

**Returns:** `Either`<`E`, `A`>

___
<a id="getmonoid"></a>

###  getMonoid

▸ **getMonoid**<`L`,`A`>(M: *`Monoid`<`A`>*): `Monoid`<`IO`<`L`, `A`>>

*Defined in [index.ts:90](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L90)*

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

*Defined in [index.ts:101](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L101)*

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

*Defined in [index.ts:80](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L80)*

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

*Defined in [index.ts:59](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L59)*

Get a monoid for IO<E, A> that combines actions by racing them.

**Type parameters:**

#### L 
#### A 

**Returns:** `Monoid`<`IO`<`L`, `A`>>

___
<a id="getsemigroup"></a>

###  getSemigroup

▸ **getSemigroup**<`L`,`A`>(S: *`Semigroup`<`A`>*): `Semigroup`<`IO`<`L`, `A`>>

*Defined in [index.ts:70](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L70)*

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

*Defined in [index.ts:31](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L31)*

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

*Defined in [index.ts:33](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L33)*

**Type parameters:**

#### L 
#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `A` |

**Returns:** `IO`<`L`, `A`>

___
<a id="optionally"></a>

###  optionally

▸ **optionally**<`E`,`A`>(io: *`IO`<`E`, `A` \| `null` \| `undefined`>*): `IO`<`E`, `Option`<`A`>>

*Defined in [index.ts:115](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L115)*

fromNullable lifted over the IO type

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| io | `IO`<`E`, `A` \| `null` \| `undefined`> |   |

**Returns:** `IO`<`E`, `Option`<`A`>>

___

## Object literals

<a id="monad"></a>

### `<Const>` monad

**monad**: *`object`*

*Defined in [index.ts:38](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L38)*

Get the Monad instance for an IO<E, A>

<a id="monad.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [index.ts:39](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L39)*

___
<a id="monad.map"></a>

####  map

**● map**: *[map]()*

*Defined in [index.ts:40](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L40)*

___
<a id="monad.of"></a>

####  of

**● of**: *[of]()*

*Defined in [index.ts:41](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L41)*

___
<a id="monad.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *`IO`<`L`, `function`>*, fa: *`IO`<`L`, `A`>*): `IO`<`L`, `B`>

*Defined in [index.ts:42](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L42)*

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

*Defined in [index.ts:43](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L43)*

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

*Defined in [index.ts:49](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L49)*

Get a parallel applicative instance for IO<E, A>

<a id="parallelapplicative.uri"></a>

####  URI

**● URI**: *"IO"*

*Defined in [index.ts:50](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L50)*

___
<a id="parallelapplicative.map"></a>

####  map

**● map**: *[map]()*

*Defined in [index.ts:51](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L51)*

___
<a id="parallelapplicative.of"></a>

####  of

**● of**: *[of]()*

*Defined in [index.ts:52](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L52)*

___
<a id="parallelapplicative.ap"></a>

####  ap

▸ **ap**<`L`,`A`,`B`>(fab: *`IO`<`L`, `function`>*, fa: *`IO`<`L`, `A`>*): `IO`<`L`, `B`>

*Defined in [index.ts:53](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide-fp-ts/src/index.ts#L53)*

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

