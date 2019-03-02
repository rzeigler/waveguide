[waveguide](../README.md) > [Runtime](../classes/runtime.md)

# Class: Runtime

## Type parameters
#### E 
#### A 
## Hierarchy

**Runtime**

## Index

### Properties

* [asyncFrame](runtime.md#asyncframe)
* [callFrames](runtime.md#callframes)
* [criticalSections](runtime.md#criticalsections)
* [enterCritical](runtime.md#entercritical)
* [interrupted](runtime.md#interrupted)
* [leaveCritical](runtime.md#leavecritical)
* [result](runtime.md#result)
* [started](runtime.md#started)
* [suspended](runtime.md#suspended)

### Methods

* [complete](runtime.md#complete)
* [contextSwitch](runtime.md#contextswitch)
* [interrupt](runtime.md#interrupt)
* [interruptComplete](runtime.md#interruptcomplete)
* [interruptFinalize](runtime.md#interruptfinalize)
* [interruptLoop](runtime.md#interruptloop)
* [interruptLoopResume](runtime.md#interruptloopresume)
* [loop](runtime.md#loop)
* [loopResume](runtime.md#loopresume)
* [popFrame](runtime.md#popframe)
* [start](runtime.md#start)
* [step](runtime.md#step)
* [unwindError](runtime.md#unwinderror)
* [unwindInterrupt](runtime.md#unwindinterrupt)

---

## Properties

<a id="asyncframe"></a>

### `<Private>` asyncFrame

**● asyncFrame**: *[AsyncFrame](asyncframe.md) \| `undefined`*

*Defined in [runtime.ts:91](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L91)*

___
<a id="callframes"></a>

### `<Private>` callFrames

**● callFrames**: *[Frame](../#frame)[]* =  []

*Defined in [runtime.ts:92](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L92)*

___
<a id="criticalsections"></a>

### `<Private>` criticalSections

**● criticalSections**: *`number`* = 0

*Defined in [runtime.ts:93](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L93)*

___
<a id="entercritical"></a>

### `<Private>` enterCritical

**● enterCritical**: *[IO](io.md)<`unknown`, `unknown`>* =  IO.eval(() => {
    this.criticalSections++;
  }).widenError<unknown>()

*Defined in [runtime.ts:97](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L97)*

___
<a id="interrupted"></a>

### `<Private>` interrupted

**● interrupted**: *`boolean`* = false

*Defined in [runtime.ts:94](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L94)*

___
<a id="leavecritical"></a>

### `<Private>` leaveCritical

**● leaveCritical**: *[IO](io.md)<`unknown`, `unknown`>* =  IO.eval(() => {
    this.criticalSections--;
  }).widenError<unknown>()

*Defined in [runtime.ts:101](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L101)*

___
<a id="result"></a>

###  result

**● result**: *[OneShot](oneshot.md)<[FiberResult](../#fiberresult)<`E`, `A`>>* =  new OneShot()

*Defined in [runtime.ts:88](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L88)*

___
<a id="started"></a>

### `<Private>` started

**● started**: *`boolean`* = false

*Defined in [runtime.ts:90](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L90)*

___
<a id="suspended"></a>

### `<Private>` suspended

**● suspended**: *`boolean`* = true

*Defined in [runtime.ts:95](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L95)*

___

## Methods

<a id="complete"></a>

### `<Private>` complete

▸ **complete**(result: *[Result](../#result)<`unknown`, `unknown`>*): `void`

*Defined in [runtime.ts:179](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L179)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| result | [Result](../#result)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="contextswitch"></a>

### `<Private>` contextSwitch

▸ **contextSwitch**(continuation: *`function`*, resume: *`function`*, complete: *`function`*): `void`

*Defined in [runtime.ts:254](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L254)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| continuation | `function` |
| resume | `function` |
| complete | `function` |

**Returns:** `void`

___
<a id="interrupt"></a>

###  interrupt

▸ **interrupt**(): `void`

*Defined in [runtime.ts:113](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L113)*

**Returns:** `void`

___
<a id="interruptcomplete"></a>

### `<Private>` interruptComplete

▸ **interruptComplete**(_: *[Result](../#result)<`unknown`, `unknown`>*): `void`

*Defined in [runtime.ts:192](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L192)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| _ | [Result](../#result)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="interruptfinalize"></a>

### `<Private>` interruptFinalize

▸ **interruptFinalize**(): `void`

*Defined in [runtime.ts:161](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L161)*

**Returns:** `void`

___
<a id="interruptloop"></a>

### `<Private>` interruptLoop

▸ **interruptLoop**(io: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*): `void`

*Defined in [runtime.ts:171](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L171)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`unknown`, `unknown`> |
| resume | `function` |

**Returns:** `void`

___
<a id="interruptloopresume"></a>

### `<Private>` interruptLoopResume

▸ **interruptLoopResume**(next: *[IO](io.md)<`unknown`, `unknown`>*): `void`

*Defined in [runtime.ts:142](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L142)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| next | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="loop"></a>

### `<Private>` loop

▸ **loop**(io: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*): `void`

*Defined in [runtime.ts:147](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L147)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`unknown`, `unknown`> |
| resume | `function` |

**Returns:** `void`

___
<a id="loopresume"></a>

### `<Private>` loopResume

▸ **loopResume**(next: *[IO](io.md)<`unknown`, `unknown`>*): `void`

*Defined in [runtime.ts:137](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L137)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| next | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="popframe"></a>

### `<Private>` popFrame

▸ **popFrame**(result: *`unknown`*, complete: *`function`*): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [runtime.ts:270](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L270)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| result | `unknown` |
| complete | `function` |

**Returns:** [IO](io.md)<`unknown`, `unknown`> \| `undefined`

___
<a id="start"></a>

###  start

▸ **start**(io: *[IO](io.md)<`E`, `A`>*): `void`

*Defined in [runtime.ts:105](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L105)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`E`, `A`> |

**Returns:** `void`

___
<a id="step"></a>

### `<Private>` step

▸ **step**(current: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*, complete: *`function`*): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [runtime.ts:196](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L196)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| current | [IO](io.md)<`unknown`, `unknown`> |
| resume | `function` |
| complete | `function` |

**Returns:** [IO](io.md)<`unknown`, `unknown`> \| `undefined`

___
<a id="unwinderror"></a>

### `<Private>` unwindError

▸ **unwindError**(cause: *[Cause](../#cause)<`unknown`>*, complete: *`function`*): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [runtime.ts:281](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L281)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| cause | [Cause](../#cause)<`unknown`> |
| complete | `function` |

**Returns:** [IO](io.md)<`unknown`, `unknown`> \| `undefined`

___
<a id="unwindinterrupt"></a>

### `<Private>` unwindInterrupt

▸ **unwindInterrupt**(): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [runtime.ts:311](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/runtime.ts#L311)*

**Returns:** [IO](io.md)<`unknown`, `unknown`> \| `undefined`

___

