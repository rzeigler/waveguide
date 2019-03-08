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

*Defined in [internal/oneshot.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L12)*

**Returns:** [OneShot](oneshot.md)

___

## Properties

<a id="listeners"></a>

### `<Private>` listeners

**● listeners**: *`Array`<`function`>*

*Defined in [internal/oneshot.ts:12](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L12)*

___
<a id="value"></a>

### `<Private>` value

**● value**: *`Option`<`A`>* =  none

*Defined in [internal/oneshot.ts:9](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L9)*

___

## Methods

<a id="count"></a>

###  count

▸ **count**(): `number`

*Defined in [internal/oneshot.ts:26](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L26)*

**Returns:** `number`

___
<a id="get"></a>

###  get

▸ **get**(): `Option`<`A`>

*Defined in [internal/oneshot.ts:50](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L50)*

**Returns:** `Option`<`A`>

___
<a id="isset"></a>

###  isSet

▸ **isSet**(): `boolean`

*Defined in [internal/oneshot.ts:30](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L30)*

**Returns:** `boolean`

___
<a id="isunset"></a>

###  isUnset

▸ **isUnset**(): `boolean`

*Defined in [internal/oneshot.ts:34](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L34)*

**Returns:** `boolean`

___
<a id="listen"></a>

###  listen

▸ **listen**(f: *`function`*): `void`

*Defined in [internal/oneshot.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L38)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___
<a id="set"></a>

###  set

▸ **set**(value: *`A`*): `void`

*Defined in [internal/oneshot.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| value | `A` |

**Returns:** `void`

___
<a id="unlisten"></a>

###  unlisten

▸ **unlisten**(f: *`function`*): `void`

*Defined in [internal/oneshot.ts:46](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/oneshot.ts#L46)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___

