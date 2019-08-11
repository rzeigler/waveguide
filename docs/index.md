---
title: Introduction
permalink: /
nav_order: 1
has_children: true
has_toc: false
---


## Getting Started
```
import * as wave, { IO } from "waveguide/lib/io"
```

## Quick examples
For a quick overview of what IO can do see the [overview example](https://github.com/rzeigler/waveguide/blob/master/examples/)

## Constructing an IO
There are a number of ways of constructing IOs exported from the /lib/io module
They include
    - `succeed` -- create a successful IO
    - `failed` -- create a failed IO
    - `async` -- create an asynchronous effect based on callbacks
    - `suspend` -- create a synchronous efffect
There are also a number of functions to construct IOs from Promises and fp-ts tasks

## Using an IO
`IO<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with typeclass instances for Monad and parallel Applicative.
These instances are the exports io and par respectively from /lib/io
Furthermore, there are a several resource acquisition functions such as `bracket` and `onComplete` which guarantee IO actions happen in the fact of errors or interuption.
These respect interruptible state

## Resources
Any RIO<E, A> may be safely used as a resource acquisition using the `bracket` or `bracketExit` combinators.
Once the resource is acquired, the release action will always happen. 
`bracketExit` is a more powerful form of `bracket` where the `Exit` of the resource use action is also available.
If all you need is to ensure that an acquired resource is cleaned up, there is also the Resource data type which forms a Monad for nesting resource scopes.

## Fibers
An `IO<E, A>` may be converted to a fiber using `fork()`.
The result being an `IO<never, Fiber<E, A>>`.
The IO action is now running in the background and can be interrupted, waited, or joined.
`interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in.
`join` will halt the progress of the current fiber until the result of the target fiber is known.
`wait` will await the termination of a fiber either by interruption or completion and produce the Exit status. 


## Running
IOs are lazy so they don't actually do anything until they are interpreted.
`unsafeRun` will begin running a fiber and returns a cancellation action.
`unsafeRunToPromise` will return a promise of the result of the fiber, rejecting if a failure is encountered.
`unsafeRunToPromiseTotal` will return a promise of an `Exit<E, A>` for the result of evaluation. This promis will not reject.
Once an IO is launched its runloop will execute synchronous effects continuously until an asynchronous boundary is hit.
If this is undesirable insert `io.shift` or `io.shiftAsync` calls at appropriate points.
IO can be used to perform long-running tasks without resorting to service workers on the main thread in this way.


## Concurrency Abstractions
Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), Semaphore, and an asynchronous queue implementation.
