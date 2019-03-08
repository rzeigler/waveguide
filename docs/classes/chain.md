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

*Defined in [internal/iostep.ts:57](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L57)*

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

*Defined in [internal/iostep.ts:57](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L57)*

___
<a id="chain-1"></a>

###  chain

**● chain**: *`function`*

*Defined in [internal/iostep.ts:58](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L58)*

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

*Defined in [internal/iostep.ts:58](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L58)*

___

