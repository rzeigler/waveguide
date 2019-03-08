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

*Defined in [internal/iostep.ts:37](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L37)*

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

*Defined in [internal/iostep.ts:37](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L37)*

___
<a id="thunk"></a>

###  thunk

**● thunk**: *`function`*

*Defined in [internal/iostep.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/iostep.ts#L38)*

#### Type declaration
▸(): [IO](io.md)<`E`, `A`>

**Returns:** [IO](io.md)<`E`, `A`>

___

