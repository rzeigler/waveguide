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

* [interrputAndWait](fiber.md#interrputandwait)
* [interrupt](fiber.md#interrupt)
* [join](fiber.md#join)
* [runtime](fiber.md#runtime)
* [wait](fiber.md#wait)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Fiber**(runtime: *[Runtime](runtime.md)<`E`, `A`>*): [Fiber](fiber.md)

*Defined in [fiber.ts:30](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L30)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| runtime | [Runtime](runtime.md)<`E`, `A`> |

**Returns:** [Fiber](fiber.md)

___

## Properties

<a id="interrputandwait"></a>

###  interrputAndWait

**● interrputAndWait**: *[IO](io.md)<`never`, `void`>*

*Defined in [fiber.ts:30](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L30)*

Interrupt the fiber and then await for its finalizers to run

___
<a id="interrupt"></a>

###  interrupt

**● interrupt**: *[IO](io.md)<`never`, `void`>*

*Defined in [fiber.ts:25](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L25)*

Interrupt the fiber

This immediately returns (there are performance considerations when interrupting many fibers and waiting on them) If you need to ensure that the target fiber has finished its cleanup use interruptAndWait

___
<a id="join"></a>

###  join

**● join**: *[IO](io.md)<`E`, `A`>*

*Defined in [fiber.ts:12](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L12)*

Join on this fiber.

Logically blocks calling fiber until a result is ready. If the target fiber is interrupted this will trigger an abort.

___
<a id="runtime"></a>

###  runtime

**● runtime**: *[Runtime](runtime.md)<`E`, `A`>*

*Defined in [fiber.ts:32](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L32)*

___
<a id="wait"></a>

###  wait

**● wait**: *[IO](io.md)<`never`, [FiberResult](../#fiberresult)<`E`, `A`>>*

*Defined in [fiber.ts:17](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/fiber.ts#L17)*

Wait for fiber completion by complete, failure, or interruption

___

