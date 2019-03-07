[waveguide](../README.md) > [OnDone](../classes/ondone.md)

# Class: OnDone

## Type parameters
#### E 
#### B 
#### A 
## Hierarchy

**OnDone**

## Index

### Constructors

* [constructor](ondone.md#constructor)

### Properties

* [_tag](ondone.md#_tag)
* [always](ondone.md#always)
* [first](ondone.md#first)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OnDone**(first: *[IO](io.md)<`E`, `A`>*, always: *[IO](io.md)<`never`, `B`>*): [OnDone](ondone.md)

*Defined in [iostep.ts:85](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/iostep.ts#L85)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| first | [IO](io.md)<`E`, `A`> |
| always | [IO](io.md)<`never`, `B`> |

**Returns:** [OnDone](ondone.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"ondone"* = "ondone"

*Defined in [iostep.ts:85](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/iostep.ts#L85)*

___
<a id="always"></a>

###  always

**● always**: *[IO](io.md)<`never`, `B`>*

*Defined in [iostep.ts:86](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/iostep.ts#L86)*

___
<a id="first"></a>

###  first

**● first**: *[IO](io.md)<`E`, `A`>*

*Defined in [iostep.ts:86](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/iostep.ts#L86)*

___

