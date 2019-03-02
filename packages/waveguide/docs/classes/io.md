[waveguide](../README.md) > [IO](../classes/io.md)

# Class: IO

## Type parameters
#### E 
#### A 
## Hierarchy

**IO**

## Index

### Constructors

* [constructor](io.md#constructor)

### Properties

* [step](io.md#step)

### Methods

* [ap](io.md#ap)
* [ap_](io.md#ap_)
* [applyFirst](io.md#applyfirst)
* [applySecond](io.md#applysecond)
* [as](io.md#as)
* [attempt](io.md#attempt)
* [chain](io.md#chain)
* [chainCause](io.md#chaincause)
* [chainError](io.md#chainerror)
* [critical](io.md#critical)
* [delay](io.md#delay)
* [flatten](io.md#flatten)
* [forever](io.md#forever)
* [fork](io.md#fork)
* [launch](io.md#launch)
* [map](io.md#map)
* [map2](io.md#map2)
* [mapError](io.md#maperror)
* [onDone](io.md#ondone)
* [onError](io.md#onerror)
* [onInterrupt](io.md#oninterrupt)
* [parAp](io.md#parap)
* [parAp_](io.md#parap_)
* [parApplyFirst](io.md#parapplyfirst)
* [parApplySecond](io.md#parapplysecond)
* [parMap2](io.md#parmap2)
* [parProduct](io.md#parproduct)
* [peek](io.md#peek)
* [product](io.md#product)
* [promised](io.md#promised)
* [promisedResult](io.md#promisedresult)
* [race](io.md#race)
* [raceOneOf](io.md#raceoneof)
* [resurrect](io.md#resurrect)
* [slay](io.md#slay)
* [use](io.md#use)
* [use_](io.md#use_)
* [void](io.md#void)
* [when](io.md#when)
* [widen](io.md#widen)
* [widenError](io.md#widenerror)
* [yield_](io.md#yield_)
* [aborted](io.md#aborted)
* [assimilate](io.md#assimilate)
* [async](io.md#async)
* [asyncCritical](io.md#asynccritical)
* [caused](io.md#caused)
* [delay](io.md#delay-1)
* [eval](io.md#eval)
* [failed](io.md#failed)
* [never_](io.md#never_)
* [of](io.md#of)
* [pure](io.md#pure)
* [suspend](io.md#suspend)
* [void](io.md#void-1)
* [yield_](io.md#yield_-1)

---

## Constructors

<a id="constructor"></a>

### `<Private>` constructor

⊕ **new IO**(step: *[IOStep](../#iostep)<`E` \| `never`, `A` \| `never`>*): [IO](io.md)

*Defined in [io.ts:164](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L164)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| step | [IOStep](../#iostep)<`E` \| `never`, `A` \| `never`> |

**Returns:** [IO](io.md)

___

## Properties

<a id="step"></a>

###  step

**● step**: *[IOStep](../#iostep)<`E` \| `never`, `A` \| `never`>*

*Defined in [io.ts:166](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L166)*

___

## Methods

<a id="ap"></a>

###  ap

▸ **ap**<`B`>(fab: *[IO](io.md)<`E`, `function`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:210](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L210)*

Apply the function produced by fab to the result of this after both fab and this are run in sequence

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fab | [IO](io.md)<`E`, `function`> |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="ap_"></a>

###  ap_

▸ **ap_**<`B`,`C`>(this: *[IO](io.md)<`E`, `function`>*, fb: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `C`>

*Defined in [io.ts:222](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L222)*

**Type parameters:**

#### B 
#### C 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | [IO](io.md)<`E`, `function`> |
| fb | [IO](io.md)<`E`, `B`> |

**Returns:** [IO](io.md)<`E`, `C`>

___
<a id="applyfirst"></a>

###  applyFirst

▸ **applyFirst**<`B`>(fb: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:234](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L234)*

Run this and fb in sequence and take the result of this.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fb | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="applysecond"></a>

###  applySecond

▸ **applySecond**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, `B`>

*Defined in [io.ts:252](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L252)*

Run this and fb in sequence and take the result of fb

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, `B`>

___
<a id="as"></a>

###  as

▸ **as**<`B`>(b: *`B`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:439](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L439)*

Produce an IO that succeeds with b if this IO succeeds with a value.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `B` |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="attempt"></a>

###  attempt

▸ **attempt**(): [IO](io.md)<`never`, [Attempt](../#attempt)<`E`, `A`>>

*Defined in [io.ts:320](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L320)*

Run this and produce either a Value or a Raise depending on the result

**Returns:** [IO](io.md)<`never`, [Attempt](../#attempt)<`E`, `A`>>

___
<a id="chain"></a>

###  chain

▸ **chain**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, f: *`function`*): [IO](io.md)<`EE`, `B`>

*Defined in [io.ts:292](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L292)*

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| f | `function` |

**Returns:** [IO](io.md)<`EE`, `B`>

___
<a id="chaincause"></a>

###  chainCause

▸ **chainCause**<`AA`,`EE`>(this: *[IO](io.md)<`E`, `AA` \| `never`>*, f: *`function`*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:304](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L304)*

Run this and if an error is produced, attempt to recover using f.

More powerful version of chainError which provides the full Cause. This allows trapping Aborts as well as seeing any nested errors in Cause.

**Type parameters:**

#### AA 
#### EE 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E`, `AA` \| `never`> |  \- |
| f | `function` |   |

**Returns:** [IO](io.md)<`EE`, `AA`>

___
<a id="chainerror"></a>

###  chainError

▸ **chainError**<`AA`,`EE`>(this: *[IO](io.md)<`E`, `AA` \| `never`>*, f: *`function`*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:313](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L313)*

Run this and if an error is produced, attempt to recover using f.

**Type parameters:**

#### AA 
#### EE 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E`, `AA` \| `never`> |  \- |
| f | `function` |   |

**Returns:** [IO](io.md)<`EE`, `AA`>

___
<a id="critical"></a>

###  critical

▸ **critical**(): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:490](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L490)*

Construct an IO that is the uncancellable version of this

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="delay"></a>

###  delay

▸ **delay**(millis: *`number`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:469](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L469)*

Delay the execution of this IO by some time.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| millis | `number` |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="flatten"></a>

###  flatten

▸ **flatten**<`EE`,`AA`>(this: *[IO](io.md)<`EE` \| `never`, [IO](io.md)<`EE` \| `never`, `AA`>>*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:284](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L284)*

Flatten an IO<E, IO<E, A>> into an IO<E, A>

**Type parameters:**

#### EE 
#### AA 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, [IO](io.md)<`EE` \| `never`, `AA`>> |   |

**Returns:** [IO](io.md)<`EE`, `AA`>

___
<a id="forever"></a>

###  forever

▸ **forever**(): [IO](io.md)<`E`, `never`>

*Defined in [io.ts:345](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L345)*

Execute this action forever (or until interrupted)

**Returns:** [IO](io.md)<`E`, `never`>

___
<a id="fork"></a>

###  fork

▸ **fork**(): [IO](io.md)<`never`, [Fiber](fiber.md)<`E`, `A`>>

*Defined in [io.ts:506](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L506)*

Produce an IO that when run will spawn this as a fiber.

**Returns:** [IO](io.md)<`never`, [Fiber](fiber.md)<`E`, `A`>>

___
<a id="launch"></a>

###  launch

▸ **launch**(callback?: *`undefined` \| `function`*): `function`

*Defined in [io.ts:522](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L522)*

Run this.

Accepts an optional callback that receives the result of the runtime. Returns a function that can be used to interrupt.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` callback | `undefined` \| `function` |   |

**Returns:** `function`

___
<a id="map"></a>

###  map

▸ **map**<`B`>(f: *`function`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:168](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L168)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="map2"></a>

###  map2

▸ **map2**<`EE`,`B`,`C`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*, f: *`function`*): [IO](io.md)<`EE`, `C`>

*Defined in [io.ts:177](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L177)*

Apply f to the result of both this and fb when run in sequence.

**Type parameters:**

#### EE 
#### B 
#### C 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |  \- |
| f | `function` |   |

**Returns:** [IO](io.md)<`EE`, `C`>

___
<a id="maperror"></a>

###  mapError

▸ **mapError**<`F`>(f: *`function`*): [IO](io.md)<`F`, `A`>

*Defined in [io.ts:181](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L181)*

**Type parameters:**

#### F 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`F`, `A`>

___
<a id="ondone"></a>

###  onDone

▸ **onDone**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, always: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, `A`>

*Defined in [io.ts:353](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L353)*

Ensure that if this IO has begun executing always will always be executed as cleanup.

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| always | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, `A`>

___
<a id="onerror"></a>

###  onError

▸ **onError**<`B`>(error: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:363](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L363)*

Ensure that if this IO fails, error will always be executed.

If error fails the resulting cause will have both errors.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| error | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="oninterrupt"></a>

###  onInterrupt

▸ **onInterrupt**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, interrupt: *[IO](io.md)<`EE` \| `never`, `B`>*): [IO](io.md)<`EE`, `A`>

*Defined in [io.ts:378](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L378)*

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| interrupt | [IO](io.md)<`EE` \| `never`, `B`> |

**Returns:** [IO](io.md)<`EE`, `A`>

___
<a id="parap"></a>

###  parAp

▸ **parAp**<`B`>(fab: *[IO](io.md)<`E`, `function`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:218](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L218)*

Apply the function produced by fab to the result of this after both fab and this are run in parallel.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fab | [IO](io.md)<`E`, `function`> |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="parap_"></a>

###  parAp_

▸ **parAp_**<`B`,`C`>(this: *[IO](io.md)<`E`, `function`>*, fb: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `C`>

*Defined in [io.ts:226](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L226)*

**Type parameters:**

#### B 
#### C 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | [IO](io.md)<`E`, `function`> |
| fb | [IO](io.md)<`E`, `B`> |

**Returns:** [IO](io.md)<`E`, `C`>

___
<a id="parapplyfirst"></a>

###  parApplyFirst

▸ **parApplyFirst**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, `A`>

*Defined in [io.ts:244](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L244)*

Run this and fb in parallel and take the result of this.

If either fail which error is produced is undefined

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, `A`>

___
<a id="parapplysecond"></a>

###  parApplySecond

▸ **parApplySecond**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, `B`>

*Defined in [io.ts:260](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L260)*

Run this and fb in parallel and take the result of fb

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, `B`>

___
<a id="parmap2"></a>

###  parMap2

▸ **parMap2**<`EE`,`B`,`C`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*, f: *`function`*): [IO](io.md)<`EE`, `C`>

*Defined in [io.ts:190](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L190)*

Apply f to the result of both this and fb run in parallel

**Type parameters:**

#### EE 
#### B 
#### C 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |  \- |
| f | `function` |   |

**Returns:** [IO](io.md)<`EE`, `C`>

___
<a id="parproduct"></a>

###  parProduct

▸ **parProduct**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, [`A`, `B`]>

*Defined in [io.ts:276](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L276)*

Run this and fb in parallel and produce a tuple of their results.

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, [`A`, `B`]>

___
<a id="peek"></a>

###  peek

▸ **peek**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, f: *`function`*): [IO](io.md)<`EE`, `A`>

*Defined in [io.ts:288](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L288)*

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| f | `function` |

**Returns:** [IO](io.md)<`EE`, `A`>

___
<a id="product"></a>

###  product

▸ **product**<`EE`,`B`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE`, `B`>*): [IO](io.md)<`EE`, [`A`, `B`]>

*Defined in [io.ts:268](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L268)*

Run this and fb in sequence and produce a tuple of their results.

**Type parameters:**

#### EE 
#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE`, `B`> |   |

**Returns:** [IO](io.md)<`EE`, [`A`, `B`]>

___
<a id="promised"></a>

###  promised

▸ **promised**(): `Promise`<`A`>

*Defined in [io.ts:541](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L541)*

Run this and return a promise of the result.

Rejects if this produces a Raise or an Abort. Does not resolve if the runtime is interrupted. However, given that the runtime is not exposed, this is not a problem as of yet.

**Returns:** `Promise`<`A`>

___
<a id="promisedresult"></a>

###  promisedResult

▸ **promisedResult**(): `Promise`<[FiberResult](../#fiberresult)<`E`, `A`>>

*Defined in [io.ts:564](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L564)*

Run this and return a promise of the result.

Resolves with the result of the fiber. Never rejects.

**Returns:** `Promise`<[FiberResult](../#fiberresult)<`E`, `A`>>

___
<a id="race"></a>

###  race

▸ **race**(other: *[IO](io.md)<`E`, `A`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:447](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L447)*

Race this with other. The first result, either success or failure is taken

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| other | [IO](io.md)<`E`, `A`> |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="raceoneof"></a>

###  raceOneOf

▸ **raceOneOf**<`B`>(other: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, [OneOf](../#oneof)<`A`, `B`>>

*Defined in [io.ts:460](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L460)*

Race this with other producing which result was used. The first result either success or failure is taken.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| other | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, [OneOf](../#oneof)<`A`, `B`>>

___
<a id="resurrect"></a>

###  resurrect

▸ **resurrect**(): [IO](io.md)<`never`, [Result](../#result)<`E`, `A`>>

*Defined in [io.ts:328](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L328)*

Run this and trap all exit cases lifting the Result into the value.

**Returns:** [IO](io.md)<`never`, [Result](../#result)<`E`, `A`>>

___
<a id="slay"></a>

###  slay

▸ **slay**<`EE`,`AA`>(this: *[IO](io.md)<`never`, [Result](../#result)<`EE`, `AA`>>*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:337](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L337)*

Inverse of resurrect which submerges a Result back into the IO

**Type parameters:**

#### EE 
#### AA 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`never`, [Result](../#result)<`EE`, `AA`>> |   |

**Returns:** [IO](io.md)<`EE`, `AA`>

___
<a id="use"></a>

###  use

▸ **use**<`B`>(release: *`function`*, consume: *`function`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:391](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L391)*

A resource management construct.

Treat this as an action producing a resource. If this is successful, guaranteee that the IO produced by release will be executed following the IO produced by consume even on error or interrupt. this is always uninterruptible

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| release | `function` |  a function producing a resource release IO |
| consume | `function` |  a function producing the IO to continue with |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="use_"></a>

###  use_

▸ **use_**<`B`>(release: *`function`*, inner: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:402](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L402)*

A weaker form of use that does not provide the resource to the continuation Used for cases where the inner effect may depends on the effects of the resource acquisition/release But not the resource itself

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| release | `function` |  \- |
| inner | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="void"></a>

###  void

▸ **void**(): [IO](io.md)<`E`, `void`>

*Defined in [io.ts:431](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L431)*

Produce an IO that succeeds with void if this IO succeeds with a value

**Returns:** [IO](io.md)<`E`, `void`>

___
<a id="when"></a>

###  when

▸ **when**(test: *[IO](io.md)<`E`, `boolean`>*): [IO](io.md)<`E`, `void`>

*Defined in [io.ts:499](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L499)*

Produce an IO that will run this if and only if test produces true.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| test | [IO](io.md)<`E`, `boolean`> |   |

**Returns:** [IO](io.md)<`E`, `void`>

___
<a id="widen"></a>

###  widen

▸ **widen**<`AA`>(this: *[IO](io.md)<`E`, `A extends AA ? AA : never`>*): [IO](io.md)<`E`, `AA`>

*Defined in [io.ts:413](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L413)*

Widen the result type.

Does nothing and hopefully gets inlined. There are a few edge cases where 'casting' is useful and this provides a controlled variant

**Type parameters:**

#### AA 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E`, `A extends AA ? AA : never`> |   |

**Returns:** [IO](io.md)<`E`, `AA`>

___
<a id="widenerror"></a>

###  widenError

▸ **widenError**<`EE`>(this: *[IO](io.md)<`E extends EE ? EE : never`, `A`>*): [IO](io.md)<`EE`, `A`>

*Defined in [io.ts:424](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L424)*

Widen the error type.

Does nothing and hopefully gets inlined. There are a few edge cases where 'casting' is useful and this provides a controlled variant

**Type parameters:**

#### EE 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E extends EE ? EE : never`, `A`> |   |

**Returns:** [IO](io.md)<`EE`, `A`>

___
<a id="yield_"></a>

###  yield_

▸ **yield_**(): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:483](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L483)*

Introduce an asynchronous boundary before the execution of this

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="aborted"></a>

### `<Static>` aborted

▸ **aborted**(abort: *[Abort](abort.md)*): [IO](io.md)<`never`, `never`>

*Defined in [io.ts:74](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L74)*

Construct an IO that has aborted with the given reason

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| abort | [Abort](abort.md) |   |

**Returns:** [IO](io.md)<`never`, `never`>

___
<a id="assimilate"></a>

### `<Static>` assimilate

▸ **assimilate**<`A`>(thunk: *`function`*): [IO](io.md)<`unknown`, `A`>

*Defined in [io.ts:160](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L160)*

Construct an IO from a promise.

The resulting IO is uncancellable due to standard promise semantics. If you want cancellation and are using a library that supports it like bluebird, you need to roll your own converter using async

**Type parameters:**

#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| thunk | `function` |   |

**Returns:** [IO](io.md)<`unknown`, `A`>

___
<a id="async"></a>

### `<Static>` async

▸ **async**<`E`,`A`>(start: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:96](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L96)*

Construct an IO from an asynchronous effect.

Evaluating this IO will cause the runloop to pause and then resume once the callback provided to start is executed. Start should return a thunk that can be used to cancel the asynchronous action.

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| start | `function` |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="asynccritical"></a>

### `<Static>` asyncCritical

▸ **asyncCritical**<`E`,`A`>(start: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:104](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L104)*

Construct an IO from an asynchronous effect that cannot be cancelled.

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| start | `function` |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="caused"></a>

### `<Static>` caused

▸ **caused**<`E`>(cause: *[Cause](../#cause)<`E`>*): [IO](io.md)<`E`, `never`>

*Defined in [io.ts:84](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L84)*

Construct an IO that failed with the given cause.

You probably don't need this. It exists to facilitate easily reraising errors in the runtime.

**Type parameters:**

#### E 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| cause | [Cause](../#cause)<`E`> |   |

**Returns:** [IO](io.md)<`E`, `never`>

___
<a id="delay-1"></a>

### `<Static>` delay

▸ **delay**(millis: *`number`*): [IO](io.md)<`never`, `void`>

*Defined in [io.ts:122](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L122)*

Construct an IO that will succeed with undefined after some duration

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| millis | `number` |  the delay |

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="eval"></a>

### `<Static>` eval

▸ **eval**<`A`>(thunk: *`function`*): [IO](io.md)<`never`, `A`>

*Defined in [io.ts:35](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L35)*

Construct an IO that when run will evaluate the provided function to produce a value.

The contract of the function is that it will never fail, however, any exceptions thrown during the execution of the function will trigger an Abort and begin cleanup

**Type parameters:**

#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| thunk | `function` |  a function returning an A |

**Returns:** [IO](io.md)<`never`, `A`>

___
<a id="failed"></a>

### `<Static>` failed

▸ **failed**<`E`>(e: *`E`*): [IO](io.md)<`E`, `never`>

*Defined in [io.ts:66](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L66)*

Construct an IO that is failed.

**Type parameters:**

#### E 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| e | `E` |   |

**Returns:** [IO](io.md)<`E`, `never`>

___
<a id="never_"></a>

### `<Static>` never_

▸ **never_**(): [IO](io.md)<`never`, `never`>

*Defined in [io.ts:146](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L146)*

Construct an IO that never succeeds or errors. Useful as a base case for racing many IOs.

**Returns:** [IO](io.md)<`never`, `never`>

___
<a id="of"></a>

### `<Static>` of

▸ **of**<`A`>(a: *`A`*): [IO](io.md)<`never`, `A`>

*Defined in [io.ts:13](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L13)*

Construct an IO from a pure value.

**Type parameters:**

#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| a | `A` |   |

**Returns:** [IO](io.md)<`never`, `A`>

___
<a id="pure"></a>

### `<Static>` pure

▸ **pure**<`E`,`A`>(a: *`A`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:24](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L24)*

Construct an IO from a pure value.

Allows specifying an error type (which could have been never) to fit into the type checker.

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| a | `A` |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="suspend"></a>

### `<Static>` suspend

▸ **suspend**<`E`,`A`>(thunk: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:58](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L58)*

Construct an IO that when run will produce the next IO to run.

This is useful in the case where the synchronous effect you are performing may fail or you want to do some effectful setup before dispatching the next action.

*__example__*:
 ```
(str: string) => IO.suspend<string, number>(() => {
   const num = parseInt(str, 10);
   if (num === num) {
     return IO.of(num);
   } else {
     return IO.failed(str);
   }
});
```

**Type parameters:**

#### E 
#### A 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| thunk | `function` |  a function returning the next IO to r un |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="void-1"></a>

### `<Static>` void

▸ **void**(): [IO](io.md)<`never`, `void`>

*Defined in [io.ts:114](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L114)*

Construct an IO that is already succeeded with an undefined value

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="yield_-1"></a>

### `<Static>` yield_

▸ **yield_**(): [IO](io.md)<`never`, `void`>

*Defined in [io.ts:138](https://github.com/rzeigler/waveguide/blob/c6446d5/packages/waveguide/src/io.ts#L138)*

Construct an IO that will introduce an asynchronous boundary. Can be used to prevent blocking the runloop for very long synchronous effects.

**Returns:** [IO](io.md)<`never`, `void`>

___

