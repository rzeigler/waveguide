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

*Defined in [internal/runtime.ts:45](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L45)*

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

*Defined in [internal/runtime.ts:45](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L45)*

___
<a id="io"></a>

###  io

**● io**: *[IO](io.md)<`unknown`, `unknown`>*

*Defined in [internal/runtime.ts:46](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L46)*

___

## Methods

<a id="apply"></a>

###  apply

▸ **apply**(a: *`unknown`*): [IO](io.md)<`unknown`, `unknown`>

*Implementation of [Call](../interfaces/call.md).[apply](../interfaces/call.md#apply)*

*Defined in [internal/runtime.ts:50](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L50)*

Normal processing of interrupt frames mean we do nothign

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `unknown` |

**Returns:** [IO](io.md)<`unknown`, `unknown`>

___

