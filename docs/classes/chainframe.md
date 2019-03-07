[waveguide](../README.md) > [ChainFrame](../classes/chainframe.md)

# Class: ChainFrame

## Hierarchy

**ChainFrame**

## Implements

* [Call](../interfaces/call.md)

## Index

### Constructors

* [constructor](chainframe.md#constructor)

### Properties

* [_tag](chainframe.md#_tag)
* [f](chainframe.md#f)

### Methods

* [apply](chainframe.md#apply)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ChainFrame**(f: *`function`*): [ChainFrame](chainframe.md)

*Defined in [runtime.ts:32](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L32)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [ChainFrame](chainframe.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"chain"* = "chain"

*Defined in [runtime.ts:32](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L32)*

___
<a id="f"></a>

###  f

**● f**: *`function`*

*Defined in [runtime.ts:33](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L33)*

#### Type declaration
▸(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [runtime.ts:37](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L37)*

Invoke the chain method

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

