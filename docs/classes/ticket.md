[waveguide](../README.md) > [Ticket](../classes/ticket.md)

# Class: Ticket

Provides encapsulation mechanism for blocking waits that should perform cleanup when interrupted

## Type parameters
#### A 
## Hierarchy

**Ticket**

## Index

### Constructors

* [constructor](ticket.md#constructor)

### Properties

* [cleanup](ticket.md#cleanup)
* [wait](ticket.md#wait)

### Methods

* [cleanup](ticket.md#cleanup-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Ticket**(wait: *[IO](io.md)<`never`, `A`>*, cleanup: *[IO](io.md)<`never`, `void`>*): [Ticket](ticket.md)

*Defined in [internal/ticket.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/ticket.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| wait | [IO](io.md)<`never`, `A`> |
| cleanup | [IO](io.md)<`never`, `void`> |

**Returns:** [Ticket](ticket.md)

___

## Properties

<a id="cleanup"></a>

###  cleanup

**● cleanup**: *[IO](io.md)<`never`, `void`>*

*Defined in [internal/ticket.ts:19](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/ticket.ts#L19)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, `A`>*

*Defined in [internal/ticket.ts:19](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/ticket.ts#L19)*

___

## Methods

<a id="cleanup-1"></a>

### `<Static>` cleanup

▸ **cleanup**<`A`>(ticket: *[Ticket](ticket.md)<`A`>*, result: *[FiberResult](../#fiberresult)<`never`, `A`>*): [IO](io.md)<`never`, `void`>

*Defined in [internal/ticket.ts:13](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/ticket.ts#L13)*

**Type parameters:**

#### A 
**Parameters:**

| Name | Type |
| ------ | ------ |
| ticket | [Ticket](ticket.md)<`A`> |
| result | [FiberResult](../#fiberresult)<`never`, `A`> |

**Returns:** [IO](io.md)<`never`, `void`>

___

