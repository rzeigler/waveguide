[waveguide](../README.md) > [Chain](../classes/chain.md)

# Class: Chain

## Type parameters
#### E 
#### Left 
#### A 
## Hierarchy

**Chain**

## Index

### Constructors

* [constructor](chain.md#constructor)

### Properties

* [_tag](chain.md#_tag)
* [chain](chain.md#chain-1)
* [left](chain.md#left)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Chain**(left: *[IO](io.md)<`E`, `Left`>*, chain: *`function`*): [Chain](chain.md)

*Defined in [iostep.ts:52](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L52)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| left | [IO](io.md)<`E`, `Left`> |
| chain | `function` |

**Returns:** [Chain](chain.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"chain"* = "chain"

*Defined in [iostep.ts:52](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L52)*

___
<a id="chain-1"></a>

###  chain

**● chain**: *`function`*

*Defined in [iostep.ts:53](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L53)*

#### Type declaration
▸(left: *`Left`*): [IO](io.md)<`E`, `A`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| left | `Left` |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="left"></a>

###  left

**● left**: *[IO](io.md)<`E`, `Left`>*

*Defined in [iostep.ts:53](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L53)*

___

