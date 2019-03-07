[waveguide](../README.md) > [OneShot](../classes/oneshot.md)

# Class: OneShot

## Type parameters
#### A 
## Hierarchy

**OneShot**

## Index

### Constructors

* [constructor](oneshot.md#constructor)

### Properties

* [listeners](oneshot.md#listeners)
* [value](oneshot.md#value)
* [wasSet](oneshot.md#wasset)

### Methods

* [count](oneshot.md#count)
* [get](oneshot.md#get)
* [isSet](oneshot.md#isset)
* [isUnset](oneshot.md#isunset)
* [listen](oneshot.md#listen)
* [set](oneshot.md#set)
* [unlisten](oneshot.md#unlisten)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OneShot**(): [OneShot](oneshot.md)

*Defined in [oneshot.ts:20](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L20)*

**Returns:** [OneShot](oneshot.md)

___

## Properties

<a id="listeners"></a>

### `<Private>` listeners

**● listeners**: *`Array`<`function`>*

*Defined in [oneshot.ts:20](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L20)*

___
<a id="value"></a>

### `<Private>` value

**● value**: *`A` \| `undefined`*

*Defined in [oneshot.ts:16](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L16)*

___
<a id="wasset"></a>

### `<Private>` wasSet

**● wasSet**: *`boolean`* = false

*Defined in [oneshot.ts:19](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L19)*

___

## Methods

<a id="count"></a>

###  count

▸ **count**(): `number`

*Defined in [oneshot.ts:35](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L35)*

**Returns:** `number`

___
<a id="get"></a>

###  get

▸ **get**(): `A` \| `undefined`

*Defined in [oneshot.ts:59](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L59)*

**Returns:** `A` \| `undefined`

___
<a id="isset"></a>

###  isSet

▸ **isSet**(): `boolean`

*Defined in [oneshot.ts:39](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L39)*

**Returns:** `boolean`

___
<a id="isunset"></a>

###  isUnset

▸ **isUnset**(): `boolean`

*Defined in [oneshot.ts:43](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L43)*

**Returns:** `boolean`

___
<a id="listen"></a>

###  listen

▸ **listen**(f: *`function`*): `void`

*Defined in [oneshot.ts:47](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L47)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___
<a id="set"></a>

###  set

▸ **set**(value: *`A`*): `void`

*Defined in [oneshot.ts:26](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L26)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| value | `A` |

**Returns:** `void`

___
<a id="unlisten"></a>

###  unlisten

▸ **unlisten**(f: *`function`*): `void`

*Defined in [oneshot.ts:55](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/oneshot.ts#L55)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___

