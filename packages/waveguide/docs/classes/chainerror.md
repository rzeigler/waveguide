[waveguide](../README.md) > [ChainError](../classes/chainerror.md)

# Class: ChainError

## Type parameters
#### E 
#### LeftError 
#### A 
## Hierarchy

**ChainError**

## Index

### Constructors

* [constructor](chainerror.md#constructor)

### Properties

* [_tag](chainerror.md#_tag)
* [chain](chainerror.md#chain)
* [left](chainerror.md#left)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ChainError**(left: *[IO](io.md)<`LeftError`, `A`>*, chain: *`function`*): [ChainError](chainerror.md)

*Defined in [iostep.ts:47](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L47)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| left | [IO](io.md)<`LeftError`, `A`> |
| chain | `function` |

**Returns:** [ChainError](chainerror.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"chainerror"* = "chainerror"

*Defined in [iostep.ts:47](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L47)*

___
<a id="chain"></a>

###  chain

**● chain**: *`function`*

*Defined in [iostep.ts:48](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L48)*

#### Type declaration
▸(error: *[Cause](../#cause)<`LeftError`>*): [IO](io.md)<`E`, `A`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| error | [Cause](../#cause)<`LeftError`> |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="left"></a>

###  left

**● left**: *[IO](io.md)<`LeftError`, `A`>*

*Defined in [iostep.ts:48](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L48)*

___

