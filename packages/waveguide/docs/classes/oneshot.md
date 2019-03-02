[waveguide](../README.md) > [OneShot](../classes/oneshot.md)

# Class: OneShot

## Type parameters
#### A 
## Hierarchy

**OneShot**

## Index

### Properties

* [listeners](oneshot.md#listeners)
* [value](oneshot.md#value)

### Methods

* [isSet](oneshot.md#isset)
* [isUnset](oneshot.md#isunset)
* [listen](oneshot.md#listen)
* [set](oneshot.md#set)
* [unlisten](oneshot.md#unlisten)

---

## Properties

<a id="listeners"></a>

### `<Private>` listeners

**● listeners**: *`Array`<`function`>* =  []

*Defined in [oneshot.ts:3](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L3)*

___
<a id="value"></a>

### `<Private>` value

**● value**: *`A` \| `undefined`*

*Defined in [oneshot.ts:2](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L2)*

___

## Methods

<a id="isset"></a>

###  isSet

▸ **isSet**(): `boolean`

*Defined in [oneshot.ts:13](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L13)*

**Returns:** `boolean`

___
<a id="isunset"></a>

###  isUnset

▸ **isUnset**(): `boolean`

*Defined in [oneshot.ts:17](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L17)*

**Returns:** `boolean`

___
<a id="listen"></a>

###  listen

▸ **listen**(f: *`function`*): `void`

*Defined in [oneshot.ts:21](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L21)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___
<a id="set"></a>

###  set

▸ **set**(value: *`A`*): `void`

*Defined in [oneshot.ts:5](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L5)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| value | `A` |

**Returns:** `void`

___
<a id="unlisten"></a>

###  unlisten

▸ **unlisten**(f: *`function`*): `void`

*Defined in [oneshot.ts:32](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/oneshot.ts#L32)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** `void`

___

