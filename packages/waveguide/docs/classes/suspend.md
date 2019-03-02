[waveguide](../README.md) > [Suspend](../classes/suspend.md)

# Class: Suspend

## Type parameters
#### E 
#### A 
## Hierarchy

**Suspend**

## Index

### Constructors

* [constructor](suspend.md#constructor)

### Properties

* [_tag](suspend.md#_tag)
* [thunk](suspend.md#thunk)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Suspend**(thunk: *`function`*): [Suspend](suspend.md)

*Defined in [iostep.ts:32](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L32)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| thunk | `function` |

**Returns:** [Suspend](suspend.md)

___

## Properties

<a id="_tag"></a>

###  _tag

**● _tag**: *"suspend"* = "suspend"

*Defined in [iostep.ts:32](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L32)*

___
<a id="thunk"></a>

###  thunk

**● thunk**: *`function`*

*Defined in [iostep.ts:33](https://github.com/rzeigler/waveguide/blob/79b3787/packages/waveguide/src/iostep.ts#L33)*

#### Type declaration
▸(): [IO](io.md)<`E`, `A`>

**Returns:** [IO](io.md)<`E`, `A`>

___

