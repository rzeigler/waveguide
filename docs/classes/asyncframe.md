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

*Defined in [internal/runtime.ts:75](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L75)*

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

*Defined in [internal/runtime.ts:75](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L75)*

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

*Defined in [internal/runtime.ts:74](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L74)*

___
<a id="proxy"></a>

### `<Private>` proxy

**● proxy**: *[ForwardProxy](forwardproxy.md)*

*Defined in [internal/runtime.ts:73](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L73)*

___

## Methods

<a id="go"></a>

###  go

▸ **go**(callback: *`function`*): `void`

*Defined in [internal/runtime.ts:81](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L81)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** `void`

___
<a id="interrupt"></a>

###  interrupt

▸ **interrupt**(): `void`

*Defined in [internal/runtime.ts:90](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L90)*

**Returns:** `void`

___

