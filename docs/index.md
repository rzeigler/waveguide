---
title: Introduction
permalink: /
nav_order: 1
has_children: true
has_toc: false
---


## Getting Started
```
import * as wave from "waveguide/lib/wave"
import { Wave } from "waveguide/lib/wave"
```

## Overview of Wave
The core data type in waveguide is the `Wave<E, A>`.
You may think of a `Wave<E, A>` as a description of an action that may produce a value `A` or fail with error `E`
In this way, Wave's are very similar to `() => Promise<A>` but with a typed error channel.
The primary difference is that Wave's are lazy and support cancellation and support resource safety (that is interrupt aware)

### Constructing a Wave
There are a number of ways of constructing IOs exported from the /lib/wave module
They include
    - `pure` -- create a successful Wave
    - `raiseError` -- create a failed Wave
    - `async` -- create an asynchronous effect based on callbacks
    - `sync` -- create a synchronous efffect

### Using a Wave
For a quick overview of what Wave can do see the [tutorial](https://github.com/rzeigler/waveguide/blob/master/examples/)
`Wave<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with typeclass instances for Monad and parallel Applicative.
These instances are the exports io and par respectively from waveguide/lib/wave.

As mentioend perviously, RIOs are lazy so they don't actually do anything until they are interpreted.
`run` will begin running a fiber and returns a cancellation action.
`runToPromise` will return a promise of the result of the fiber, rejecting if a failure is encountered.
`runToPromiseExit` will return a promise of an `Exit<E, A>` for the result of evaluation. This promis will not reject.
Once a Wave is launched its runloop will execute synchronous effects continuously until an asynchronous boundary is hit.
If this is undesirable insert `shift` or `shiftAsync` calls at appropriate points.
Wave can be used to perform long-running tasks without resorting to service workers on the main thread in this way.


### Resources
Any `Wave<E, A>` may be safely used as a resource acquisition using the `bracket` or `bracketExit` combinators.
Once the resource is acquired, the release action will always happen. 
`bracketExit` is a more powerful form of `bracket` where the `Exit` of the resource use action is also available.
If all you need is to ensure that an acquired resource is cleaned up, there is also the Resource data type which forms a Monad for nesting resource scopes.

### Fibers
An `Wave<E, A>` may be converted to a fiber using `fork()`.
The result being an `Wave<never, Fiber<E, A>>`.
The Wave action is now running in the background and can be interrupted, waited, or joined.
`interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in.
`join` will halt the progress of the current fiber until the result of the target fiber is known.
`wait` will await the termination of a fiber either by interruption or completion and produce the Exit status. 

## Concurrency Abstractions
Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), Semaphore, and an asynchronous queue implementation.

## Managed
Waveguide also contains a `Managed<E, A>` type as a friendly wrapper around using bracket. 
This type and friends live in `waveguide/lib/managed`;
`Managed<E, A>` is a data type that can produce a resource of `A` given an environment of `R` that is available for the duration of its `use` invocation.
`Managed` forms a monad in A where chain produces a new resource that has a scoped lifetime smaller than that of the resource it is devied from.
For example, `managed.chain(ra, (a) => createb(a))`
In this case, invoking `managed.use(rb, useB)` will:
    1) acquire a
    2) use a to acquire b
    3) use b to call useB
    4) release b
    5) release a.
    6) produce the value of useB


## Overview of WaveR
In additional to `Wave<E, A>` and `Managed<E, A>` there are a pair of types `WaveR<R, E, A>` and `Managed<R, E, A>` exported from `waveguide/lib/waver` and `waveguide/lib/managedr` respectively.
These types encode the need to have an ambient environment `R` in order to produce the effect or the resource.
`WaveR` is more or less a ReaderT stacked on top of Wave but it can also do anything `Wave` can do, including forking fibers and performing resource bracketing.
`ManagedR` is similar but for Managed.
There are corresponding functions for most actions with subtly different signatures.

## Modules
Waveguide provides a number of useful modules. By function they are:

- waveguide/lib/wave -- the core datatype
- waveguide/lib/waver -- the waver variant
- waveguide/lib/managed -- the resource management datatype
- waveguide/lib/managedr -- the resource management r variant
- waveguide/lib/exit -- the definition of the exit statuses
- waveguide/lib/driver -- the runloop of Wave may be useful if you are providing interop
- waveguide/lib/ref -- a mutable cell datatype
- waveguide/lib/deferred -- a set once awaitable mutable cell similar to Q's old Deferred.
- waveguide/lib/semaphore -- semaphore
- waveguide/lib/mutex -- mutex implemented as a semaphore with 1 permit
- waveguide/lib/queue -- various concurrent queues
- waveguide/lib/console -- the console.* functions wrapped for both Wave and WaveR

## A Note On Function Naming
waveguide uses a slightly different naming convention from fp-ts.
The two sets of instances for Wave are exported as `wave` and `parWave` from `waveguide/lib/wave`.
Generally fp-ts modules export data first functions on the typeclass instances and data last functions from the module.
Since there are a large number of Wave functions that do not correspond to typeclass implementations waveguide takes a slightly different approach.
In general, the module exports a number of data first functions such as:

* chain
* map
* chainError

It also exports a corresponding set of data last curried functions with the `With` suffix such as:

* chainWith
* mapWith
* chainErrorWith

Combinators that take multiple RIOs are different. Don't be confused by `zipWith` for instance.
