[waveguide](../README.md) > [AsyncFrame](../classes/asyncframe.md)

# Class: AsyncFrame

## Hierarchy

**AsyncFrame**

## Index

### Constructors

* [constructor](asyncframe.md#constructor)

### Properties

* [continuation](asyncframe.md#continuation)
* [interrupted](asyncframe.md#interrupted)
* [proxy](asyncframe.md#proxy)

### Methods

* [go](asyncframe.md#go)
* [interrupt](asyncframe.md#interrupt)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new AsyncFrame**(continuation: *`function`*): [AsyncFrame](asyncframe.md)

*Defined in [runtime.ts:53](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L53)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| continuation | `function` |

**Returns:** [AsyncFrame](asyncframe.md)

___

## Properties

<a id="continuation"></a>

### `<Private>` continuation

**● continuation**: *`function`*

*Defined in [runtime.ts:53](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L53)*

#### Type declaration
▸(callback: *`function`*): `function`

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** `function`

___
<a id="interrupted"></a>

### `<Private>` interrupted

**● interrupted**: *`boolean`*

*Defined in [runtime.ts:52](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L52)*

___
<a id="proxy"></a>

### `<Private>` proxy

**● proxy**: *[ForwardProxy](forwardproxy.md)*

*Defined in [runtime.ts:51](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L51)*

___

## Methods

<a id="go"></a>

###  go

▸ **go**(callback: *`function`*): `void`

*Defined in [runtime.ts:59](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L59)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** `void`

___
<a id="interrupt"></a>

###  interrupt

▸ **interrupt**(): `void`

*Defined in [runtime.ts:68](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L68)*

**Returns:** `void`

___

