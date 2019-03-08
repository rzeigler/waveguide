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

*Defined in [internal/runtime.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L23)*

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

*Defined in [internal/runtime.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L23)*

___
<a id="f"></a>

###  f

**● f**: *`function`*

*Defined in [internal/runtime.ts:24](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L24)*

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

*Defined in [internal/runtime.ts:28](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L28)*

Invoke the chain method

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

