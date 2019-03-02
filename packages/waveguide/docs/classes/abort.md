[waveguide](../README.md) > [Abort](../classes/abort.md)

# Class: Abort

## Hierarchy

**Abort**

## Index

### Constructors

* [constructor](abort.md#constructor)

### Properties

* [_tag](abort.md#_tag)
* [error](abort.md#error)
* [more](abort.md#more)

### Methods

* [and](abort.md#and)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Abort**(error: *`unknown`*, more?: *`ReadonlyArray`<[Cause](../#cause)<`unknown`>>*): [Abort](abort.md)

*Defined in [result.ts:34](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/result.ts#L34)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| error | `unknown` | - |
| `Default value` more | `ReadonlyArray`<[Cause](../#cause)<`unknown`>> |  [] |

**Returns:** [Abort](abort.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"abort"* = "abort"

*Defined in [result.ts:34](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/result.ts#L34)*

___
<a id="error"></a>

###  error

**● error**: *`unknown`*

*Defined in [result.ts:35](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/result.ts#L35)*

___
<a id="more"></a>

###  more

**● more**: *`ReadonlyArray`<[Cause](../#cause)<`unknown`>>*

*Defined in [result.ts:35](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/result.ts#L35)*

___

## Methods

<a id="and"></a>

###  and

▸ **and**(cause: *[Cause](../#cause)<`unknown`>*): [Cause](../#cause)<`unknown`>

*Defined in [result.ts:36](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/result.ts#L36)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| cause | [Cause](../#cause)<`unknown`> |

**Returns:** [Cause](../#cause)<`unknown`>

___

