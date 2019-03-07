[waveguide](../README.md) > [ErrorFrame](../classes/errorframe.md)

# Class: ErrorFrame

## Hierarchy

**ErrorFrame**

## Implements

* [Call](../interfaces/call.md)

## Index

### Constructors

* [constructor](errorframe.md#constructor)

### Properties

* [_tag](errorframe.md#_tag)
* [f](errorframe.md#f)

### Methods

* [apply](errorframe.md#apply)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ErrorFrame**(f: *`function`*): [ErrorFrame](errorframe.md)

*Defined in [runtime.ts:43](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L43)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [ErrorFrame](errorframe.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"error"* = "error"

*Defined in [runtime.ts:43](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L43)*

___
<a id="f"></a>

###  f

**● f**: *`function`*

*Defined in [runtime.ts:44](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L44)*

#### Type declaration
▸(cause: *[Cause](../#cause)<`unknown`>*): [IO](io.md)<`unknown`, `unknown`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| cause | [Cause](../#cause)<`unknown`> |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [runtime.ts:48](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/runtime.ts#L48)*

Normal processing of error frames means pass the value through directly

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

