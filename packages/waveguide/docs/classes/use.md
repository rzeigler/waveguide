[waveguide](../README.md) > [Use](../classes/use.md)

# Class: Use

## Type parameters
#### E 
#### R 
#### A 
## Hierarchy

**Use**

## Index

### Constructors

* [constructor](use.md#constructor)

### Properties

* [_tag](use.md#_tag)
* [consume](use.md#consume)
* [release](use.md#release)
* [resource](use.md#resource)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Use**(resource: *[IO](io.md)<`E`, `R`>*, release: *`function`*, consume: *`function`*): [Use](use.md)

*Defined in [iostep.ts:68](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L68)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| resource | [IO](io.md)<`E`, `R`> |
| release | `function` |
| consume | `function` |

**Returns:** [Use](use.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"use"* = "use"

*Defined in [iostep.ts:68](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L68)*

___
<a id="consume"></a>

###  consume

**● consume**: *`function`*

*Defined in [iostep.ts:71](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L71)*

#### Type declaration
▸(r: *`R`*): [IO](io.md)<`E`, `A`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| r | `R` |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="release"></a>

###  release

**● release**: *`function`*

*Defined in [iostep.ts:70](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L70)*

#### Type declaration
▸(r: *`R`*): [IO](io.md)<`E`, `void`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| r | `R` |

**Returns:** [IO](io.md)<`E`, `void`>

___
<a id="resource"></a>

###  resource

**● resource**: *[IO](io.md)<`E`, `R`>*

*Defined in [iostep.ts:69](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/iostep.ts#L69)*

___

