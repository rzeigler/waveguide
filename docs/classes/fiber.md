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

*Defined in [fiber.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L38)*

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

*Defined in [fiber.ts:31](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L31)*

Interrupt the fiber

This immediately returns (there are performance considerations when interrupting many fibers and waiting on them) If you need to ensure that the target fiber has finished its cleanup use interruptAndWait

___
<a id="interruptandwait"></a>

###  interruptAndWait

**● interruptAndWait**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`>>*

*Defined in [fiber.ts:36](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L36)*

Interrupt the fiber and then await for its finalizers to run

___
<a id="join"></a>

###  join

**● join**: *[IO](io.md)<`E`, `A`>*

*Defined in [fiber.ts:18](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L18)*

Join on this fiber.

Logically blocks calling fiber until a result is ready. If the target fiber is interrupted this will trigger an abort.

___
<a id="result"></a>

###  result

**● result**: *[IO](io.md)<`never`, `Option`<[FiberResult](../#fiberresult)<`E`, `A`>>>*

*Defined in [fiber.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L38)*

___
<a id="runtime"></a>

###  runtime

**● runtime**: *[Runtime](runtime.md)<`E`, `A`>*

*Defined in [fiber.ts:40](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L40)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`>>*

*Defined in [fiber.ts:23](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/fiber.ts#L23)*

Wait for fiber completion by complete, failure, or interruption

___

