[waveguide](../README.md) > [FinalizeFrame](../classes/finalizeframe.md)

# Class: FinalizeFrame

## Hierarchy

**FinalizeFrame**

## Implements

* [Call](../interfaces/call.md)

## Index

### Constructors

* [constructor](finalizeframe.md#constructor)

### Properties

* [_tag](finalizeframe.md#_tag)
* [io](finalizeframe.md#io)

### Methods

* [apply](finalizeframe.md#apply)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FinalizeFrame**(io: *[IO](io.md)<`unknown`, `unknown`>*): [FinalizeFrame](finalizeframe.md)

*Defined in [runtime.ts:76](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L76)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** [FinalizeFrame](finalizeframe.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"finalize"* = "finalize"

*Defined in [runtime.ts:76](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L76)*

___
<a id="io"></a>

###  io

**● io**: *[IO](io.md)<`unknown`, `unknown`>*

*Defined in [runtime.ts:77](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L77)*

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [runtime.ts:82](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L82)*

Normal processing of finalize frames means invoke the finalizer and then return the the value

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

