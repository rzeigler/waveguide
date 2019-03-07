[waveguide](../README.md) > [Raise](../classes/raise.md)

# Class: Raise

## Type parameters
#### E 
## Hierarchy

**Raise**

## Index

### Constructors

* [constructor](raise.md#constructor)

### Properties

* [_tag](raise.md#_tag)
* [error](raise.md#error)
* [more](raise.md#more)

### Methods

* [and](raise.md#and)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Raise**(error: *`E`*, more?: *`ReadonlyArray`<[Cause](../#cause)<`E`>>*): [Raise](raise.md)

*Defined in [result.ts:35](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L35)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| error | `E` | - |
| `Default value` more | `ReadonlyArray`<[Cause](../#cause)<`E`>> |  [] |

**Returns:** [Raise](raise.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"raise"* = "raise"

*Defined in [result.ts:35](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L35)*

___
<a id="error"></a>

###  error

**● error**: *`E`*

*Defined in [result.ts:36](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L36)*

___
<a id="more"></a>

###  more

**● more**: *`ReadonlyArray`<[Cause](../#cause)<`E`>>*

*Defined in [result.ts:36](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L36)*

___

## Methods

<a id="and"></a>

###  and

▸ **and**(cause: *[Cause](../#cause)<`E`>*): [Cause](../#cause)<`E`>

*Defined in [result.ts:37](https://github.com/rzeigler/waveguide/blob/05ef8da/packages/waveguide/src/result.ts#L37)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| cause | [Cause](../#cause)<`E`> |

**Returns:** [Cause](../#cause)<`E`>

___

