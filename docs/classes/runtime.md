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

*Defined in [internal/runtime.ts:101](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L101)*

___
<a id="callframes"></a>

### `<Private>` callFrames

**● callFrames**: *[Frame](../#frame)[]* =  []

*Defined in [internal/runtime.ts:102](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L102)*

___
<a id="criticalsections"></a>

### `<Private>` criticalSections

**● criticalSections**: *`number`* = 0

*Defined in [internal/runtime.ts:103](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L103)*

___
<a id="entercritical"></a>

### `<Private>` enterCritical

**● enterCritical**: *[IO](io.md)<`never`, `unknown`>* =  IO.eval(() => {
    this.criticalSections++;
  })

*Defined in [internal/runtime.ts:107](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L107)*

___
<a id="interrupted"></a>

### `<Private>` interrupted

**● interrupted**: *`boolean`* = false

*Defined in [internal/runtime.ts:104](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L104)*

___
<a id="leavecritical"></a>

### `<Private>` leaveCritical

**● leaveCritical**: *[IO](io.md)<`never`, `unknown`>* =  IO.eval(() => {
    this.criticalSections--;
  })

*Defined in [internal/runtime.ts:111](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L111)*

___
<a id="result"></a>

###  result

**● result**: *[OneShot](oneshot.md)<[FiberResult](../#fiberresult)<`E`, `A`>>* =  new OneShot()

*Defined in [internal/runtime.ts:98](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L98)*

___
<a id="started"></a>

### `<Private>` started

**● started**: *`boolean`* = false

*Defined in [internal/runtime.ts:100](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L100)*

___
<a id="suspended"></a>

### `<Private>` suspended

**● suspended**: *`boolean`* = true

*Defined in [internal/runtime.ts:105](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L105)*

___

## Methods

<a id="complete"></a>

### `<Private>` complete

▸ **complete**(result: *[Result](../#result)<`unknown`, `unknown`>*): `void`

*Defined in [internal/runtime.ts:199](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L199)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| result | [Result](../#result)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="contextswitch"></a>

### `<Private>` contextSwitch

▸ **contextSwitch**(continuation: *`function`*, resume: *`function`*, complete: *`function`*): `void`

*Defined in [internal/runtime.ts:262](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L262)*

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

*Defined in [internal/runtime.ts:123](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L123)*

**Returns:** `void`

___
<a id="interruptcomplete"></a>

### `<Private>` interruptComplete

▸ **interruptComplete**(_: *[Result](../#result)<`unknown`, `unknown`>*): `void`

*Defined in [internal/runtime.ts:212](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L212)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| _ | [Result](../#result)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="interruptfinalize"></a>

### `<Private>` interruptFinalize

▸ **interruptFinalize**(): `void`

*Defined in [internal/runtime.ts:181](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L181)*

**Returns:** `void`

___
<a id="interruptloop"></a>

### `<Private>` interruptLoop

▸ **interruptLoop**(io: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*): `void`

*Defined in [internal/runtime.ts:191](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L191)*

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

*Defined in [internal/runtime.ts:147](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L147)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| next | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="loop"></a>

### `<Private>` loop

▸ **loop**(io: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*): `void`

*Defined in [internal/runtime.ts:152](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L152)*

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

*Defined in [internal/runtime.ts:142](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L142)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| next | [IO](io.md)<`unknown`, `unknown`> |

**Returns:** `void`

___
<a id="popframe"></a>

### `<Private>` popFrame

▸ **popFrame**(result: *`unknown`*, complete: *`function`*): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [internal/runtime.ts:278](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L278)*

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

*Defined in [internal/runtime.ts:115](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L115)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| io | [IO](io.md)<`E`, `A`> |

**Returns:** `void`

___
<a id="step"></a>

### `<Private>` step

▸ **step**(current: *[IO](io.md)<`unknown`, `unknown`>*, resume: *`function`*, complete: *`function`*): [IO](io.md)<`unknown`, `unknown`> \| `undefined`

*Defined in [internal/runtime.ts:216](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L216)*

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

*Defined in [internal/runtime.ts:289](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L289)*

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

*Defined in [internal/runtime.ts:319](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/internal/runtime.ts#L319)*

**Returns:** [IO](io.md)<`unknown`, `unknown`> \| `undefined`

___

