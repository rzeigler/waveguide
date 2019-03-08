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

*Defined in [internal/runtime.ts:56](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L56)*

Construct a finalize frame. The contract is that this IO should interoperate with the runtime critical segments

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| io | [IO](io.md)<`unknown`, `unknown`> |   |

**Returns:** [FinalizeFrame](finalizeframe.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"finalize"* = "finalize"

*Defined in [internal/runtime.ts:56](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L56)*

___
<a id="io"></a>

###  io

**● io**: *[IO](io.md)<`unknown`, `unknown`>*

*Defined in [internal/runtime.ts:62](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L62)*

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [internal/runtime.ts:67](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L67)*

Normal processing of finalize frames means invoke the finalizer and then return the the value

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

