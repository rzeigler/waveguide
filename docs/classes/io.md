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

* [abort](io.md#abort)
* [ap](io.md#ap)
* [ap_](io.md#ap_)
* [applyFirst](io.md#applyfirst)
* [applySecond](io.md#applysecond)
* [as](io.md#as)
* [attempt](io.md#attempt)
* [bracket](io.md#bracket)
* [bracketExit](io.md#bracketexit)
* [chain](io.md#chain)
* [chainCause](io.md#chaincause)
* [chainError](io.md#chainerror)
* [critical](io.md#critical)
* [delay](io.md#delay)
* [ensuring](io.md#ensuring)
* [flatten](io.md#flatten)
* [forever](io.md#forever)
* [fork](io.md#fork)
* [interrupted](io.md#interrupted)
* [launch](io.md#launch)
* [map](io.md#map)
* [map2](io.md#map2)
* [mapError](io.md#maperror)
* [parAp](io.md#parap)
* [parAp_](io.md#parap_)
* [parApplyFirst](io.md#parapplyfirst)
* [parApplySecond](io.md#parapplysecond)
* [parMap2](io.md#parmap2)
* [parProduct](io.md#parproduct)
* [peek](io.md#peek)
* [peekCause](io.md#peekcause)
* [peekError](io.md#peekerror)
* [product](io.md#product)
* [promised](io.md#promised)
* [promisedResult](io.md#promisedresult)
* [race](io.md#race)
* [raceOneOf](io.md#raceoneof)
* [resurrect](io.md#resurrect)
* [slay](io.md#slay)
* [timeout](io.md#timeout)
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

*Defined in [io.ts:190](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L190)*

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

*Defined in [io.ts:192](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L192)*

___

## Methods

<a id="abort"></a>

###  abort

▸ **abort**(this: *[IO](io.md)<`E`, `boolean`>*, abort: *[Abort](abort.md)*): [IO](io.md)<`E`, `void`>

*Defined in [io.ts:580](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L580)*

Abort the current fiber if this produces true using the provided abort

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E`, `boolean`> |  \- |
| abort | [Abort](abort.md) |   |

**Returns:** [IO](io.md)<`E`, `void`>

___
<a id="ap"></a>

###  ap

▸ **ap**<`B`>(fab: *[IO](io.md)<`E`, `function`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:236](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L236)*

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

*Defined in [io.ts:248](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L248)*

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

*Defined in [io.ts:260](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L260)*

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

▸ **applySecond**<`B`>(fb: *[IO](io.md)<`E` \| `never`, `B`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:278](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L278)*

Run this and fb in sequence and take the result of fb

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fb | [IO](io.md)<`E` \| `never`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="as"></a>

###  as

▸ **as**<`B`>(b: *`B`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:499](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L499)*

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

*Defined in [io.ts:354](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L354)*

Run this and produce either a Value or a Raise depending on the result

**Returns:** [IO](io.md)<`never`, [Attempt](../#attempt)<`E`, `A`>>

___
<a id="bracket"></a>

###  bracket

▸ **bracket**<`B`>(release: *`function`*, consume: *`function`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:418](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L418)*

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
<a id="bracketexit"></a>

###  bracketExit

▸ **bracketExit**<`B`>(release: *`function`*, consume: *`function`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:439](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L439)*

A resource management construct

Treat this action as producgina resource. If this is successful, the release will always be executed following the IO produced by consume even on error or interrupt. The release and acquisition are critical sections

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| release | `function` |  \- |
| consume | `function` |   |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="chain"></a>

###  chain

▸ **chain**<`B`>(f: *`function`*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:326](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L326)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`E`, `B`>

___
<a id="chaincause"></a>

###  chainCause

▸ **chainCause**<`AA`,`EE`>(this: *[IO](io.md)<`E`, `AA` \| `never`>*, f: *`function`*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:338](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L338)*

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

*Defined in [io.ts:347](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L347)*

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

*Defined in [io.ts:562](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L562)*

Construct an IO that is the uncancellable version of this

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="delay"></a>

###  delay

▸ **delay**(millis: *`number`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:541](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L541)*

Delay the execution of this IO by some time.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| millis | `number` |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="ensuring"></a>

###  ensuring

▸ **ensuring**<`B`>(always: *[IO](io.md)<`never`, `B`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:393](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L393)*

Ensure that once the returned IO has begun executing always will always be executed regardless of error or interrupt.

It is important to note that 'begun executing' refers to the IO action being next to execute for the runloop. It is theoretically possible for the returned IO to be 'begun' executing (and thus always be registered as a cleanup action) without 'this' IO every actually starting. This is an interaction between asynchronous boundaries and critical sections, but you must account for it.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| always | [IO](io.md)<`never`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="flatten"></a>

###  flatten

▸ **flatten**<`AA`>(this: *[IO](io.md)<`E` \| `never`, [IO](io.md)<`E` \| `never`, `AA`>>*): [IO](io.md)<`E`, `AA`>

*Defined in [io.ts:310](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L310)*

Flatten an IO<E, IO<E, A>> into an IO<E, A>

**Type parameters:**

#### AA 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`E` \| `never`, [IO](io.md)<`E` \| `never`, `AA`>> |   |

**Returns:** [IO](io.md)<`E`, `AA`>

___
<a id="forever"></a>

###  forever

▸ **forever**(): [IO](io.md)<`E`, `never`>

*Defined in [io.ts:379](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L379)*

Execute this action forever (or until interrupted)

**Returns:** [IO](io.md)<`E`, `never`>

___
<a id="fork"></a>

###  fork

▸ **fork**(): [IO](io.md)<`never`, [Fiber](fiber.md)<`E`, `A`>>

*Defined in [io.ts:587](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L587)*

Produce an IO that when run will spawn this as a fiber.

**Returns:** [IO](io.md)<`never`, [Fiber](fiber.md)<`E`, `A`>>

___
<a id="interrupted"></a>

###  interrupted

▸ **interrupted**<`B`>(interrupt: *[IO](io.md)<`never`, `B`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:405](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L405)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| interrupt | [IO](io.md)<`never`, `B`> |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="launch"></a>

###  launch

▸ **launch**(callback?: *`undefined` \| `function`*): `function`

*Defined in [io.ts:605](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L605)*

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

*Defined in [io.ts:194](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L194)*

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

▸ **map2**<`EE`,`B`,`C`>(this: *[IO](io.md)<`EE` \| `never`, `A`>*, fb: *[IO](io.md)<`EE` \| `never`, `B`>*, f: *`function`*): [IO](io.md)<`EE`, `C`>

*Defined in [io.ts:203](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L203)*

Apply f to the result of both this and fb when run in sequence.

**Type parameters:**

#### EE 
#### B 
#### C 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| this | [IO](io.md)<`EE` \| `never`, `A`> |
| fb | [IO](io.md)<`EE` \| `never`, `B`> |  \- |
| f | `function` |   |

**Returns:** [IO](io.md)<`EE`, `C`>

___
<a id="maperror"></a>

###  mapError

▸ **mapError**<`F`>(f: *`function`*): [IO](io.md)<`F`, `A`>

*Defined in [io.ts:207](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L207)*

**Type parameters:**

#### F 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`F`, `A`>

___
<a id="parap"></a>

###  parAp

▸ **parAp**<`B`>(fab: *[IO](io.md)<`E`, `function`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:244](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L244)*

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

*Defined in [io.ts:252](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L252)*

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

*Defined in [io.ts:270](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L270)*

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

*Defined in [io.ts:286](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L286)*

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

*Defined in [io.ts:216](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L216)*

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

*Defined in [io.ts:302](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L302)*

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

▸ **peek**<`B`>(f: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:314](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L314)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="peekcause"></a>

###  peekCause

▸ **peekCause**<`B`>(f: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:322](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L322)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="peekerror"></a>

###  peekError

▸ **peekError**<`B`>(f: *`function`*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:318](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L318)*

**Type parameters:**

#### B 
**Parameters:**

| Name | Type |
| ------ | ------ |
| f | `function` |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="product"></a>

###  product

▸ **product**<`B`>(fb: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, [`A`, `B`]>

*Defined in [io.ts:294](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L294)*

Run this and fb in sequence and produce a tuple of their results.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fb | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, [`A`, `B`]>

___
<a id="promised"></a>

###  promised

▸ **promised**(): `Promise`<`A`>

*Defined in [io.ts:624](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L624)*

Run this and return a promise of the result.

Rejects if this produces a Raise or an Abort. Does not resolve if the runtime is interrupted. However, given that the runtime is not exposed, this is not a problem as of yet.

**Returns:** `Promise`<`A`>

___
<a id="promisedresult"></a>

###  promisedResult

▸ **promisedResult**(): `Promise`<[FiberResult](../#fiberresult)<`E`, `A`>>

*Defined in [io.ts:645](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L645)*

Run this and return a promise of the result.

Resolves with the result of the fiber. Never rejects.

**Returns:** `Promise`<[FiberResult](../#fiberresult)<`E`, `A`>>

___
<a id="race"></a>

###  race

▸ **race**(other: *[IO](io.md)<`E`, `A`>*): [IO](io.md)<`E`, `A`>

*Defined in [io.ts:507](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L507)*

Race this with other. The first result, either success or failure is taken

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| other | [IO](io.md)<`E`, `A`> |   |

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="raceoneof"></a>

###  raceOneOf

▸ **raceOneOf**<`B`>(other: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `Either`<`A`, `B`>>

*Defined in [io.ts:520](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L520)*

Race this with other producing which result was used. The first result either success or failure is taken.

**Type parameters:**

#### B 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| other | [IO](io.md)<`E`, `B`> |   |

**Returns:** [IO](io.md)<`E`, `Either`<`A`, `B`>>

___
<a id="resurrect"></a>

###  resurrect

▸ **resurrect**(): [IO](io.md)<`never`, [Result](../#result)<`E`, `A`>>

*Defined in [io.ts:362](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L362)*

Run this and trap all exit cases lifting the Result into the value.

**Returns:** [IO](io.md)<`never`, [Result](../#result)<`E`, `A`>>

___
<a id="slay"></a>

###  slay

▸ **slay**<`EE`,`AA`>(this: *[IO](io.md)<`never`, [Result](../#result)<`EE`, `AA`>>*): [IO](io.md)<`EE`, `AA`>

*Defined in [io.ts:371](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L371)*

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
<a id="timeout"></a>

###  timeout

▸ **timeout**(millis: *`number`*): [IO](io.md)<`E`, `Option`<`A`>>

*Defined in [io.ts:532](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L532)*

Run this IO with a timeout.

If this succeeds before the timeout, produces an A, otherwise, interrupts this and produces undefined

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| millis | `number` |   |

**Returns:** [IO](io.md)<`E`, `Option`<`A`>>

___
<a id="use_"></a>

###  use_

▸ **use_**<`B`>(release: *`function`*, inner: *[IO](io.md)<`E`, `B`>*): [IO](io.md)<`E`, `B`>

*Defined in [io.ts:462](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L462)*

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

*Defined in [io.ts:491](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L491)*

Produce an IO that succeeds with void if this IO succeeds with a value

**Returns:** [IO](io.md)<`E`, `void`>

___
<a id="when"></a>

###  when

▸ **when**(test: *[IO](io.md)<`E`, `boolean`>*): [IO](io.md)<`E`, `void`>

*Defined in [io.ts:571](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L571)*

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

*Defined in [io.ts:473](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L473)*

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

*Defined in [io.ts:484](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L484)*

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

*Defined in [io.ts:555](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L555)*

Introduce an asynchronous boundary before the execution of this

**Returns:** [IO](io.md)<`E`, `A`>

___
<a id="aborted"></a>

### `<Static>` aborted

▸ **aborted**(abort: *[Abort](abort.md)*): [IO](io.md)<`never`, `never`>

*Defined in [io.ts:99](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L99)*

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

*Defined in [io.ts:186](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L186)*

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

*Defined in [io.ts:121](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L121)*

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

*Defined in [io.ts:129](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L129)*

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

*Defined in [io.ts:109](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L109)*

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

*Defined in [io.ts:148](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L148)*

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

*Defined in [io.ts:60](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L60)*

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

*Defined in [io.ts:91](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L91)*

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

*Defined in [io.ts:172](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L172)*

Construct an IO that never succeeds or errors. Useful as a base case for racing many IOs.

**Returns:** [IO](io.md)<`never`, `never`>

___
<a id="of"></a>

### `<Static>` of

▸ **of**<`A`>(a: *`A`*): [IO](io.md)<`never`, `A`>

*Defined in [io.ts:38](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L38)*

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

*Defined in [io.ts:49](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L49)*

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

*Defined in [io.ts:83](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L83)*

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

*Defined in [io.ts:140](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L140)*

Construct an IO that is already succeeded with an undefined value

**Returns:** [IO](io.md)<`never`, `void`>

___
<a id="yield_-1"></a>

### `<Static>` yield_

▸ **yield_**(): [IO](io.md)<`never`, `void`>

*Defined in [io.ts:164](https://github.com/rzeigler/waveguide/blob/a4eddcf/src/io.ts#L164)*

Construct an IO that will introduce an asynchronous boundary. Can be used to prevent blocking the runloop for very long synchronous effects.

**Returns:** [IO](io.md)<`never`, `void`>

___

