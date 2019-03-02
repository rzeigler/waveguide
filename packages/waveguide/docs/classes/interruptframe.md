[waveguide](../README.md) > [InterruptFrame](../classes/interruptframe.md)

# Class: InterruptFrame

## Hierarchy

**InterruptFrame**

## Implements

* [Call](../interfaces/call.md)

## Index

### Constructors

* [constructor](interruptframe.md#constructor)

### Properties

* [_tag](interruptframe.md#_tag)
* [io](interruptframe.md#io)

### Methods

* [apply](interruptframe.md#apply)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InterruptFrame**(io: *[IO](io.md)<`unknown`, `unknown`>*): [InterruptFrame](interruptframe.md)

*Defined in [runtime.ts:40](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/runtime.ts#L40)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** [InterruptFrame](interruptframe.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"interrupt"* = "interrupt"

*Defined in [runtime.ts:40](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/runtime.ts#L40)*

___
<a id="io"></a>

###  io

**● io**: *[IO](io.md)<`unknown`, `unknown`>*

*Defined in [runtime.ts:41](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/runtime.ts#L41)*

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [runtime.ts:45](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/runtime.ts#L45)*

Normal processing of interrupt frames mean we do nothign

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

