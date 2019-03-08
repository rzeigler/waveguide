[waveguide](../README.md) > [OnInterrupted](../classes/oninterrupted.md)

# Class: OnInterrupted

## Type parameters
#### E 
#### B 
#### A 
## Hierarchy

**OnInterrupted**

## Index

### Constructors

* [constructor](oninterrupted.md#constructor)

### Properties

* [_tag](oninterrupted.md#_tag)
* [first](oninterrupted.md#first)
* [interupted](oninterrupted.md#interupted)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OnInterrupted**(first: *[IO](io.md)<`E`, `A`>*, interupted: *[IO](io.md)<`never`, `B`>*): [OnInterrupted](oninterrupted.md)

*Defined in [internal/iostep.ts:67](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L67)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| first | [IO](io.md)<`E`, `A`> |
| interupted | [IO](io.md)<`never`, `B`> |

**Returns:** [OnInterrupted](oninterrupted.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"oninterrupted"* = "oninterrupted"

*Defined in [internal/iostep.ts:67](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L67)*

___
<a id="first"></a>

###  first

**● first**: *[IO](io.md)<`E`, `A`>*

*Defined in [internal/iostep.ts:68](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L68)*

___
<a id="interupted"></a>

###  interupted

**● interupted**: *[IO](io.md)<`never`, `B`>*

*Defined in [internal/iostep.ts:68](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L68)*

___

