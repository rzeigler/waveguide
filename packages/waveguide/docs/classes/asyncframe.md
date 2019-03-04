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

*Defined in [runtime.ts:84](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L84)*

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

*Defined in [runtime.ts:84](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L84)*

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

*Defined in [runtime.ts:83](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L83)*

___
<a id="proxy"></a>

### `<Private>` proxy

**● proxy**: *[ForwardProxy](forwardproxy.md)*

*Defined in [runtime.ts:82](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L82)*

___

## Methods

<a id="go"></a>

###  go

▸ **go**(callback: *`function`*): `void`

*Defined in [runtime.ts:90](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L90)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** `void`

___
<a id="interrupt"></a>

###  interrupt

▸ **interrupt**(): `void`

*Defined in [runtime.ts:99](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L99)*

**Returns:** `void`

___

