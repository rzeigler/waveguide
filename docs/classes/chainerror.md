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

*Defined in [internal/iostep.ts:52](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L52)*

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

*Defined in [internal/iostep.ts:52](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L52)*

___
<a id="chain"></a>

###  chain

**● chain**: *`function`*

*Defined in [internal/iostep.ts:53](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L53)*

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

*Defined in [internal/iostep.ts:53](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L53)*

___

