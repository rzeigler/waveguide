---
title: Introduction
permalink: /
nav_order: 1
has_children: true
has_toc: false
---


## Getting Started
```
import * as wave from "waveguide/lib/io"
import { RIO } from "waveguide/lib/io"
```

## Overview of RIO
The core data type in waveguide is the `RIO<R, E, A>`.
You may think of a `RIO<R, E, A>` as a description of an action that, given some environment `R`, may produce a value `A` or fail with error `E`
In this way, RIO's are very similar to `(r: R) => Promise<A>` but with a typed error channel.
Additionally, RIO's are always lazy. 
The action described by a RIO will never occur until it is explicitly started by using one of the run combinators.
Additionally, RIO has pervasive support for interruption and resource safety.
A running RIO may be interrupted and it will terminate as soon as it leaves an uninterruptible section (and all acquired resources are cleaned up).
There is also a type alias `IO<E, A>` which requires an empty environment.

### Constructing an IO
There are a number of ways of constructing IOs exported from the /lib/io module
They include
    - `pure` -- create a successful IO
    - `raiseError` -- create a failed IO
    - `async` -- create an asynchronous effect based on callbacks
    - `sync` -- create a synchronous efffect

### Using an IO
For a quick overview of what IO can do see the [tutorial](https://github.com/rzeigler/waveguide/blob/master/examples/)
`RIO<R, E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with typeclass instances for Monad and parallel Applicative.
These instances are the exports io and par respectively from /lib/io.

As mentioend perviously, RIOs are lazy so they don't actually do anything until they are interpreted.
`unsafeRunR` will begin running a fiber and returns a cancellation action.
`unsafeRunToPromiseR` will return a promise of the result of the fiber, rejecting if a failure is encountered.
`unsafeRunToPromiseTotalR` will return a promise of an `Exit<E, A>` for the result of evaluation. This promis will not reject.
Once an IO is launched its runloop will execute synchronous effects continuously until an asynchronous boundary is hit.
If this is undesirable insert `io.shift` or `io.shiftAsync` calls at appropriate points.
IO can be used to perform long-running tasks without resorting to service workers on the main thread in this way.


### Resources
Any RIO<E, A> may be safely used as a resource acquisition using the `bracket` or `bracketExit` combinators.
Once the resource is acquired, the release action will always happen. 
`bracketExit` is a more powerful form of `bracket` where the `Exit` of the resource use action is also available.
If all you need is to ensure that an acquired resource is cleaned up, there is also the Resource data type which forms a Monad for nesting resource scopes.

### Fibers
An `IO<E, A>` may be converted to a fiber using `fork()`.
The result being an `IO<never, Fiber<E, A>>`.
The IO action is now running in the background and can be interrupted, waited, or joined.
`interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in.
`join` will halt the progress of the current fiber until the result of the target fiber is known.
`wait` will await the termination of a fiber either by interruption or completion and produce the Exit status. 

## Concurrency Abstractions
Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), Semaphore, and an asynchronous queue implementation.

## Managed
Waveguide also contains a `Managed<R, E, A>` type as a friendly wrapper around using bracket.
`Managed<R, E, A>` is a data type that can produce a resource of `A` given an environment of `R` that is available for the duration of its `use` invocation.
`Managed` forms a monad in A where chain produces a new resource that has a scoped lifetime smaller than that of the resource it is devied from.
For example, `resource.chain(ra, (a) => createb(a))`
In this case, invoking `resource.use(rb, useB)` will:
    1) acquire a
    2) use a to acquire b
    3) use b to call useB
    4) release b
    5) release a.
    6) produce the value of useB


## A Note On Function Naming
waveguide uses a slightly different naming convention from fp-ts.
The two sets of instances for RIO are exported as `instances` and `parInstances` from `lib/io`.
Generally fp-ts modules export data first functions on the typeclass instances and data last functions from the module.
Since there are a large number of IO functions that do not correspond to typeclass implementations waveguide takes a slightly different approach.
In general, the module exports a number of data first functions such as:
    * chain
    * map
    * chainError
It also exports a corresponding set of data last curried functions with the `With` suffix such as:
    * chainWith
    * mapWith
    * chainErrorWith
Combinators that take multiple RIOs are different. Don't be confused by `zipWith` for instance.
