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

⊕ **new OnDone**(first: *[IO](io.md)<`E`, `A`>*, always: *[IO](io.md)<`E`, `B`>*): [OnDone](ondone.md)

*Defined in [iostep.ts:58](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L58)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| first | [IO](io.md)<`E`, `A`> |
| always | [IO](io.md)<`E`, `B`> |

**Returns:** [OnDone](ondone.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"ondone"* = "ondone"

*Defined in [iostep.ts:58](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L58)*

___
<a id="always"></a>

###  always

**● always**: *[IO](io.md)<`E`, `B`>*

*Defined in [iostep.ts:59](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L59)*

___
<a id="first"></a>

###  first

**● first**: *[IO](io.md)<`E`, `A`>*

*Defined in [iostep.ts:59](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L59)*

___

