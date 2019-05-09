---
title: io.ts
nav_order: 6
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [InterruptMaskCutout (type alias)](#interruptmaskcutout-type-alias)
- [PlatformGADT (type alias)](#platformgadt-type-alias)
- [Step (type alias)](#step-type-alias)
- [URI (type alias)](#uri-type-alias)
- [Async (class)](#async-class)
- [Caused (class)](#caused-class)
- [Chain (class)](#chain-class)
- [Complete (class)](#complete-class)
- [Fold (class)](#fold-class)
- [GetDriver (class)](#getdriver-class)
- [GetInterruptible (class)](#getinterruptible-class)
- [GetRuntime (class)](#getruntime-class)
- [IO (class)](#io-class)
  - [map (method)](#map-method)
  - [as (method)](#as-method)
  - [unit (method)](#unit-method)
  - [mapError (method)](#maperror-method)
  - [zipWith (method)](#zipwith-method)
  - [zip (method)](#zip-method)
  - [applyFirst (method)](#applyfirst-method)
  - [applySecond (method)](#applysecond-method)
  - [ap (method)](#ap-method)
  - [ap\_ (method)](#ap_-method)
  - [chain (method)](#chain-method)
  - [chainError (method)](#chainerror-method)
  - [fold (method)](#fold-method)
  - [foldCause (method)](#foldcause-method)
  - [flip (method)](#flip-method)
  - [result (method)](#result-method)
  - [interruptible (method)](#interruptible-method)
  - [uninterruptible (method)](#uninterruptible-method)
  - [interruptibleState (method)](#interruptiblestate-method)
  - [widenError (method)](#widenerror-method)
  - [widen (method)](#widen-method)
  - [delay (method)](#delay-method)
  - [bracketExit (method)](#bracketexit-method)
  - [bracket (method)](#bracket-method)
  - [fork (method)](#fork-method)
  - [shift (method)](#shift-method)
  - [shiftAsync (method)](#shiftasync-method)
  - [onCompleted (method)](#oncompleted-method)
  - [onInterrupted (method)](#oninterrupted-method)
  - [into (method)](#into-method)
  - [flatten (method)](#flatten-method)
  - [parZipWith (method)](#parzipwith-method)
  - [parAp (method)](#parap-method)
  - [parAp\_ (method)](#parap_-method)
  - [parApplySecond (method)](#parapplysecond-method)
  - [parApplyFirst (method)](#parapplyfirst-method)
  - [race (method)](#race-method)
  - [raceSuccess (method)](#racesuccess-method)
  - [unsafeRun (method)](#unsaferun-method)
  - [unsafeRunToPromise (method)](#unsaferuntopromise-method)
  - [unsafeRunExitToPromise (method)](#unsaferunexittopromise-method)
- [InterruptibleState (class)](#interruptiblestate-class)
- [PlatformInterface (class)](#platforminterface-class)
- [Succeeded (class)](#succeeded-class)
- [Suspend (class)](#suspend-class)
- [URI (constant)](#uri-constant)
- [fail (constant)](#fail-constant)
- [getInterruptible (constant)](#getinterruptible-constant)
- [getRuntime (constant)](#getruntime-constant)
- [interrupted (constant)](#interrupted-constant)
- [io (constant)](#io-constant)
- [never (constant)](#never-constant)
- [par (constant)](#par-constant)
- [shift (constant)](#shift-constant)
- [shiftAsync (constant)](#shiftasync-constant)
- [succeed (constant)](#succeed-constant)
- [unit (constant)](#unit-constant)
- [abort (function)](#abort-function)
- [after (function)](#after-function)
- [async (function)](#async-function)
- [asyncTotal (function)](#asynctotal-function)
- [bracket (function)](#bracket-function)
- [bracketC (function)](#bracketc-function)
- [bracketExit (function)](#bracketexit-function)
- [bracketExitC (function)](#bracketexitc-function)
- [completeWith (function)](#completewith-function)
- [delay (function)](#delay-function)
- [effect (function)](#effect-function)
- [failC (function)](#failc-function)
- [fromPromise (function)](#frompromise-function)
- [fromPromiseL (function)](#frompromisel-function)
- [fromSyncIO (function)](#fromsyncio-function)
- [fromSyncIOEither (function)](#fromsyncioeither-function)
- [fromTask (function)](#fromtask-function)
- [fromTaskEither (function)](#fromtaskeither-function)
- [interruptible (function)](#interruptible-function)
- [interruptibleMask (function)](#interruptiblemask-function)
- [interruptibleState (function)](#interruptiblestate-function)
- [makeInterruptMaskCutout (function)](#makeinterruptmaskcutout-function)
- [raceFold (function)](#racefold-function)
- [succeedC (function)](#succeedc-function)
- [suspend (function)](#suspend-function)
- [uninterruptible (function)](#uninterruptible-function)
- [uninterruptibleMask (function)](#uninterruptiblemask-function)

---

# InterruptMaskCutout (type alias)

The type of a function that allows setting interruptibility within a masked region

**Signature**

```ts
export type InterruptMaskCutout<E, A> = Function1<IO<E, A>, IO<E, A>>
```

# PlatformGADT (type alias)

**Signature**

```ts
export type PlatformGADT<E, A> =
  | (Runtime extends A ? GetRuntime : never)
  | (boolean extends A ? GetInterruptible : never)
```

# Step (type alias)

**Signature**

```ts
export type Step<E, A> =
  | Succeeded<E, A>
  | Caused<E, A>
  | Complete<E, A>
  | Suspend<E, A>
  | Async<E, A>
  | Chain<E, any, A>
  | Fold<any, E, any, A>
  | InterruptibleState<E, A>
  | PlatformInterface<E, A>
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Async (class)

**Signature**

```ts
export class Async<E, A> {
  constructor(public readonly op: Function1<Function1<Either<E, A>, void>, Lazy<void>>) { ... }
  ...
}
```

# Caused (class)

**Signature**

```ts
export class Caused<E, A> {
  constructor(public readonly cause: Cause<E>) { ... }
  ...
}
```

# Chain (class)

**Signature**

```ts
export class Chain<E, Z, A> {
  constructor(public readonly inner: IO<E, Z>,
              public readonly bind: Function1<Z, IO<E, A>>) { ... }
  ...
}
```

# Complete (class)

**Signature**

```ts
export class Complete<E, A> {
  constructor(public readonly status: Exit<E, A>) { ... }
  ...
}
```

# Fold (class)

**Signature**

```ts
export class Fold<E1, E2, A1, A2> {
  constructor(public readonly inner: IO<E1, A1>,
              public readonly failure: Function1<Cause<E1>, IO<E2, A2>>,
              public readonly success: Function1<A1, IO<E2, A2>>) { ... }
  ...
}
```

# GetDriver (class)

**Signature**

```ts
export class GetDriver { ... }
```

# GetInterruptible (class)

**Signature**

```ts
export class GetInterruptible { ... }
```

# GetRuntime (class)

**Signature**

```ts
export class GetRuntime { ... }
```

# IO (class)

**Signature**

```ts
export class IO<E, A> {
  constructor(public readonly step: Step<E, A>) { ... }
  ...
}
```

## map (method)

Construct a new IO by applying f to the value produced by this

**Signature**

```ts
public map<B>(f: Function1<A, B>): IO<E, B> { ... }
```

## as (method)

Construct a new IO that discards the value this produces in favor of b

**Signature**

```ts
public as<B>(b: B): IO<E, B> { ... }
```

## unit (method)

Construct a new IOI that discards the value this produces in favor of void (undefined)

**Signature**

```ts
public unit(): IO<E, void> { ... }
```

## mapError (method)

Construct a new IO by applying f to the error produced by this

**Signature**

```ts
public mapError<E2>(f: Function1<E, E2>): IO<E2, A> { ... }
```

## zipWith (method)

Construct a new IO by applying f to the results of this and iob together

**Signature**

```ts
public zipWith<B, C>(iob: IO<E, B>, f: Function2<A, B, C>): IO<E, C> { ... }
```

## zip (method)

Construct a new IO by forming a tuple from the values produced by this and iob

**Signature**

```ts
public zip<B>(iob: IO<E, B>): IO<E, [A, B]> { ... }
```

## applyFirst (method)

Construct a new IO that will first execute this and then execute iob and produce the value produced by this

**Signature**

```ts
public applyFirst<B>(iob: IO<E, B>): IO<E, A> { ... }
```

## applySecond (method)

Construct a new IO that wil execute this and then iob and produce the value produced by iob

**Signature**

```ts
public applySecond<B>(iob: IO<E, B>): IO<E, B> { ... }
```

## ap (method)

Construct a new IO that will execute the function produced by iof against the value produced by this

**Signature**

```ts
public ap<B>(iof: IO<E, Function1<A, B>>): IO<E, B> { ... }
```

## ap\_ (method)

Flipped version of ap

**Signature**

```ts
public ap_<B, C>(this: IO<E, Function1<B, C>>, iob: IO<E, B>): IO<E, C> { ... }
```

## chain (method)

Construct a new IO that will evaluate this for its value and if successful then evaluate the IO produced by f
applied to that value

**Signature**

```ts
public chain<B>(f: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

## chainError (method)

Construct a new IO that will evaluate this for its value and if unsuccessful then evaluate the IO produced by f
applied to that error

**Signature**

```ts
public chainError<E2>(f: Function1<E, IO<E2, A>>): IO<E2, A> { ... }
```

## fold (method)

**Signature**

```ts
public fold<B>(failed: Function1<E, IO<E, B>>, succeeded: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

## foldCause (method)

**Signature**

```ts
public foldCause<B>(failed: Function1<Cause<E>, IO<E, B>>, succeeded: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

## flip (method)

Construct a new IO that inverts the success and error channels of this

**Signature**

```ts
public flip(): IO<A, E> { ... }
```

## result (method)

Construct a new IO that will run this to completion and produce the resulting exit status

Any error type may be set for easier integration into other chains

**Signature**

```ts
public result<EE = never>(): IO<EE, Exit<E, A>> { ... }
```

## interruptible (method)

Construct an IO like this only is encased in an interruptible region

**Signature**

```ts
public interruptible(): IO<E, A> { ... }
```

## uninterruptible (method)

Cosntruct an IO like this only is encased in an uninterruptible region

**Signature**

```ts
public uninterruptible(): IO<E, A> { ... }
```

## interruptibleState (method)

Construct an IO like this only is encased in a region where interruptibility is set to state

**Signature**

```ts
public interruptibleState(state: boolean): IO<E, A> { ... }
```

## widenError (method)

Allow downcasting the error type parameter.

Most useful for introducing an error type when currently set to never

**Signature**

```ts
public widenError<EE>(this: IO<E extends EE ? EE : never, A>): IO<EE, A> { ... }
```

## widen (method)

Allow downcasting the value type parameter.

Most useful for introducing a value when when currently set to never`

**Signature**

```ts
public widen<AA>(this: IO<E, A extends AA ? AA : never>): IO<E, AA> { ... }
```

## delay (method)

**Signature**

```ts
public delay(ms: number): IO<E, A> { ... }
```

## bracketExit (method)

**Signature**

```ts
public bracketExit<B>(release: Function2<A, Exit<E, B>, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

## bracket (method)

**Signature**

```ts
public bracket<B>(release: Function1<A, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

## fork (method)

**Signature**

```ts
public fork(name?: string): IO<never, Fiber<E, A>> { ... }
```

## shift (method)

**Signature**

```ts
public shift(): IO<E, A> { ... }
```

## shiftAsync (method)

**Signature**

```ts
public shiftAsync(): IO<E, A> { ... }
```

## onCompleted (method)

Ensure that finalizer is evaluated whenever this has begun executing

**Signature**

```ts
public onCompleted(finalizer: IO<E, unknown>): IO<E, A> { ... }
```

## onInterrupted (method)

Ensure that finalizer is evaluated when ever this has been interrupted after it begins execting

**Signature**

```ts
public onInterrupted(finalizer: IO<E, unknown>): IO<E, A> { ... }
```

## into (method)

Create an IO that proxies the result of this into the target deferred

**Signature**

```ts
public into(target: Deferred<E, A>): IO<never, void> { ... }
```

## flatten (method)

Flatten an IO. This is equivalent to io.chain(identity) when applicable

**Signature**

```ts
public flatten<EE, AA>(this: IO<EE, IO<EE, AA>>): IO<EE, AA> { ... }
```

## parZipWith (method)

Zip the results of 2 IOs that are evaluated in parallel

**Signature**

```ts
public parZipWith<B, C>(other: IO<E, B>, f: Function2<A, B, C>): IO<E, C> { ... }
```

## parAp (method)

Evaluate the function produced by fio against the value produced by this

Execution occurs in parallel.

**Signature**

```ts
public parAp<B>(fio: IO<E, Function1<A, B>>): IO<E, B> { ... }
```

## parAp\_ (method)

Apply the function produced by this to the value produced by other.

Execution occurs in parallel

**Signature**

```ts
public parAp_<B, C>(this: IO<E, Function1<B, C>>, other: IO<E, B>): IO<E, C> { ... }
```

## parApplySecond (method)

Evaluate both this and other in parallel taking the value produced by other

**Signature**

```ts
public parApplySecond<B>(other: IO<E, B>): IO<E, B> { ... }
```

## parApplyFirst (method)

Evaluate both this and other in parallel, taking the value produced by this

**Signature**

```ts
public parApplyFirst(other: IO<E, unknown>): IO<E, A> { ... }
```

## race (method)

Evaluate the race of this with other.

Takes the first result, whether a success or a failure

**Signature**

```ts
public race(other: IO<E, A>): IO<E, A> { ... }
```

## raceSuccess (method)

Evaluate the race of this with other.

Takes the first successful result. If both fail, will fail with one of the resulting errors

**Signature**

```ts
public raceSuccess(other: IO<E, A>): IO<E, A> { ... }
```

## unsafeRun (method)

Begin executing this for its side effects and value.

Returns a function that can be used to interrupt execution.

**Signature**

```ts
public unsafeRun(onComplete: Function1<Exit<E, A>, void>, runtime: Runtime = defaultRuntime): Lazy<void> { ... }
```

## unsafeRunToPromise (method)

Begin executing this for its side effects and value

Returns a promise that will resolve with an A or reject with a Cause<E> depending on the exit status

**Signature**

```ts
public unsafeRunToPromise(runtime: Runtime = defaultRuntime): Promise<A> { ... }
```

## unsafeRunExitToPromise (method)

Begin executing this for its side effects and value

Returns a promise that will resolve with an Exit<E, A> and will not reject

**Signature**

```ts
public unsafeRunExitToPromise(runtime: Runtime = defaultRuntime): Promise<Exit<E, A>> { ... }
```

# InterruptibleState (class)

**Signature**

```ts
export class InterruptibleState<E, A> {
  constructor(public readonly inner: IO<E, A>, public readonly state: boolean) { ... }
  ...
}
```

# PlatformInterface (class)

**Signature**

```ts
export class PlatformInterface<E, A> {
  constructor(public readonly platform: PlatformGADT<E, A>) { ... }
  ...
}
```

# Succeeded (class)

**Signature**

```ts
export class Succeeded<E, A> {
  constructor(public readonly value: A) { ... }
  ...
}
```

# Suspend (class)

**Signature**

```ts
export class Suspend<E, A> {
  constructor(public readonly thunk: Lazy<IO<E, A>>) { ... }
  ...
}
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# fail (constant)

**Signature**

```ts
export const fail = ...
```

# getInterruptible (constant)

An IO that will access the current interruptible state of the fiber

**Signature**

```ts
export const getInterruptible: IO<never, boolean> = ...
```

# getRuntime (constant)

An IO that will access the Runtime being used to execute the IO

**Signature**

```ts
export const getRuntime: IO<never, Runtime> = ...
```

# interrupted (constant)

An IO that has been interrupted

**Signature**

```ts
export const interrupted: IO<never, never> = ...
```

# io (constant)

**Signature**

```ts
export const io: Monad2<URI> = ...
```

# never (constant)

An IO that never completes with a value.

This does however, schedule a setInterval for 60s in the background.
This should, therefore, prevent node from exiting cleanly if not interrupted

**Signature**

```ts
export const never: IO<never, never> = ...
```

# par (constant)

**Signature**

```ts
export const par: Applicative2<URI> = ...
```

# shift (constant)

An IO that uses the runtime to introduce a trampoline boundary

This can be used to acheive fairness between multiple cooperating synchronous fibers

**Signature**

```ts
export const shift: IO<never, void> = ...
```

# shiftAsync (constant)

An IO that uses the runtime to introduce an asynchronous boundary

This can be used to acheive fairness with other processes (i.e. the event loop)

**Signature**

```ts
export const shiftAsync: IO<never, void> = ...
```

# succeed (constant)

**Signature**

```ts
export const succeed = ...
```

# unit (constant)

**Signature**

```ts
export const unit: IO<never, void> = ...
```

# abort (function)

Create an IO that has aborted with the provided error

**Signature**

```ts
export function abort(e: unknown): IO<never, never> { ... }
```

# after (function)

Create an IO that when executed will complete after a fixed amount of millisenconds

**Signature**

```ts
export function after<E = never>(ms: number): IO<E, void> { ... }
```

# async (function)

Create an IO that will execute asynchronously and maybe produce a failure of type E

**Signature**

```ts
export function async<E, A>(op: Function1<Function1<Either<E, A>, void>, Lazy<void>>) { ... }
```

# asyncTotal (function)

Create an IO that will execute asynchronously and not produce a failure

**Signature**

```ts
export function asyncTotal<A>(op: Function1<Function1<A, void>, Lazy<void>>): IO<never, A> { ... }
```

# bracket (function)

**Signature**

```ts
export function bracket<E, A, B>(acquire: IO<E, A>,
                                 release: Function1<A, IO<E, unknown>>,
                                 use: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# bracketC (function)

A type curried version of bracket for better inference.

**Signature**

```ts
export const bracketC = <E, A>(acquire: IO<E, A>) =>
  <B>(release: Function1<A, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> => ...
```

# bracketExit (function)

Consume a resource in a safe manner.
This ensures that if acquire completes successfully then release will be invoked and its result evaluated with
the exit status of the result of use.

**Signature**

```ts
export function bracketExit<E, A, B>(acquire: IO<E, A>,
                                     release: Function2<A, Exit<E, B>, IO<E, unknown>>,
                                     use: Function1<A, IO<E, B>>): IO<E, B> { ... }
```

# bracketExitC (function)

**Signature**

```ts
export const bracketExitC = <E, A>(acquire: IO<E, A>) =>
  <B>(release: Function2<A, Exit<E, B>, IO<E, unknown>>, use: Function1<A, IO<E, B>>): IO<E, B> => ...
```

# completeWith (function)

Create an IO that has exited with the provided status

**Signature**

```ts
export function completeWith<E, A>(status: Exit<E, A>): IO<E, A> { ... }
```

# delay (function)

Construct an IO that delays the evaluation of inner by some duratino

**Signature**

```ts
export function delay<E, A>(inner: IO<E, A>, ms: number): IO<E, A> { ... }
```

# effect (function)

Create an IO that will execute the function (and its side effects) synchronously to produce an A

**Signature**

```ts
export function effect<A>(thunk: Lazy<A>): IO<never, A> { ... }
```

# failC (function)

A curried factory function for failed IOs

Usage: failC<number>()("boom"): IO<string, number>

If you do not need an A paramter other than enver, you may use fail instead

**Signature**

```ts
export const failC = <A = never>() => <E>(e: E): IO<E, A> => ...
```

# fromPromise (function)

Create an IO from an already running promise

The resulting IO is uninterruptible (due to the lack of cancellation semantics for es6 promises).
Note that this fits poorly with the execution model of IO which is lazy by nature.
Prefer fromPromiseL unless absolutely necessary.

**Signature**

```ts
export function fromPromise<A>(promise: Promise<A>): IO<unknown, A> { ... }
```

# fromPromiseL (function)

**Signature**

```ts
export function fromPromiseL<A>(thunk: Lazy<Promise<A>>): IO<unknown, A> { ... }
```

# fromSyncIO (function)

**Signature**

```ts
export function fromSyncIO<A>(fpio: SyncIO<A>): IO<never, A> { ... }
```

# fromSyncIOEither (function)

**Signature**

```ts
export function fromSyncIOEither<E, A>(ioe: IOEither<E, A>): IO<E, A> { ... }
```

# fromTask (function)

Create an IO from an already running task

**Signature**

```ts
export function fromTask<A>(task: Task<A>): IO<never, A> { ... }
```

# fromTaskEither (function)

**Signature**

```ts
export function fromTaskEither<E, A>(task: TaskEither<E, A>): IO<E, A> { ... }
```

# interruptible (function)

Create an interruptible version of inner

**Signature**

```ts
export function interruptible<E, A>(inner: IO<E, A>): IO<E, A> { ... }
```

# interruptibleMask (function)

Create an IO that is uninterruptible from a factory function.
The factory receives a function that can be used to restore the interruptible state was to the that of the outer
execution i.e. cut out a piece of the mask

**Signature**

```ts
export function interruptibleMask<E, A>(f: Function1<InterruptMaskCutout<E, A>, IO<E, A>>): IO<E, A> { ... }
```

# interruptibleState (function)

Create a version of inner where the interrupt flag is set to state

**Signature**

```ts
export function interruptibleState<E, A>(inner: IO<E, A>, state: boolean): IO<E, A> { ... }
```

# makeInterruptMaskCutout (function)

**Signature**

```ts
export function makeInterruptMaskCutout<E, A>(state: boolean): InterruptMaskCutout<E, A> { ... }
```

# raceFold (function)

Race two effects and fold the result

**Signature**

```ts
export function raceFold<E1, E2, A, B, C>(first: IO<E1, A>, second: IO<E1, B>,
                                          onFirstWon: Function2<Exit<E1, A>, Fiber<E1, B>, IO<E2, C>>,
                                          onSecondWon: Function2<Exit<E1, B>, Fiber<E1, A>, IO<E2, C>>): IO<E2, C> { ... }
```

# succeedC (function)

A curried factory function for successful IOs

Usage: succeedC<number>()(5) : IO<string, number>

If you do not need an E parameter other than never, you may use succeed instead.

**Signature**

```ts
export const succeedC = <E = never>() => <A>(a: A): IO<E, A> => ...
```

# suspend (function)

Create an IO that will execute the function (and its side effects) synchronously to produce the next IO to execute

**Signature**

```ts
export function suspend<E, A>(thunk: Lazy<IO<E, A>>): IO<E, A> { ... }
```

# uninterruptible (function)

Create an uninterruptible version of inner

**Signature**

```ts
export function uninterruptible<E, A>(inner: IO<E, A>): IO<E, A> { ... }
```

# uninterruptibleMask (function)

Create an IO that is uninterruptible from a factory function.
The factory receives a function that can be used to restore the interruptible state was to the that of the outer
execution i.e. cut out a piece of the mask

**Signature**

```ts
export function uninterruptibleMask<E, A>(f: Function1<InterruptMaskCutout<E, A>, IO<E, A>>): IO<E, A> { ... }
```
