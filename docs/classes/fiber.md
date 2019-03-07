[waveguide](../README.md) > [Fiber](../classes/fiber.md)

# Class: Fiber

## Type parameters
#### E 
#### A 
## Hierarchy

**Fiber**

## Index

### Constructors

* [constructor](fiber.md#constructor)

### Properties

* [interrupt](fiber.md#interrupt)
* [interruptAndWait](fiber.md#interruptandwait)
* [join](fiber.md#join)
* [result](fiber.md#result)
* [runtime](fiber.md#runtime)
* [wait](fiber.md#wait)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Fiber**(runtime: *[Runtime](runtime.md)<`E`, `A`>*): [Fiber](fiber.md)

*Defined in [fiber.ts:46](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L46)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| runtime | [Runtime](runtime.md)<`E`, `A`> |

**Returns:** [Fiber](fiber.md)

___

## Properties

<a id="interrupt"></a>

###  interrupt

**● interrupt**: *[IO](io.md)<`never`, `void`>*

*Defined in [fiber.ts:39](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L39)*

Interrupt the fiber

This immediately returns (there are performance considerations when interrupting many fibers and waiting on them) If you need to ensure that the target fiber has finished its cleanup use interruptAndWait

___
<a id="interruptandwait"></a>

###  interruptAndWait

**● interruptAndWait**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`>>*

*Defined in [fiber.ts:44](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L44)*

Interrupt the fiber and then await for its finalizers to run

___
<a id="join"></a>

###  join

**● join**: *[IO](io.md)<`E`, `A`>*

*Defined in [fiber.ts:26](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L26)*

Join on this fiber.

Logically blocks calling fiber until a result is ready. If the target fiber is interrupted this will trigger an abort.

___
<a id="result"></a>

###  result

**● result**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`> \| `undefined`>*

*Defined in [fiber.ts:46](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L46)*

___
<a id="runtime"></a>

###  runtime

**● runtime**: *[Runtime](runtime.md)<`E`, `A`>*

*Defined in [fiber.ts:48](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L48)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`>>*

*Defined in [fiber.ts:31](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/fiber.ts#L31)*

Wait for fiber completion by complete, failure, or interruption

___

