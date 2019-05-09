# waveguide

[![npm version](https://badge.fury.io/js/waveguide.svg)](https://badge.fury.io/js/waveguide)
[![CircleCI](https://circleci.com/gh/rzeigler/waveguide.svg?style=svg)](https://circleci.com/gh/rzeigler/waveguide) 
[![Join the chat at https://gitter.im/waveguide-core/community](https://badges.gitter.im/waveguide-core/community.svg)](https://gitter.im/waveguide-core/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Waveguide is a set of modules provided datatypes for encoding effects on Javascript platforms inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect) and [ZIO](https://github.com/scalaz/scalaz-zio). 
This is the core module which provides the effect type IO as well as a number of concurrency primatives.

IO is:
- Lazy. Work is not done until explicitly asked for and interruption can be used to stop work that is no longer needed.
- Unifies synchronous and asynchronous effects. The core runloop will run until an asynchronous boundary is encountered and then suspend. It is always possible to manually insert asynchronous boundaries manually to avoid blocking the main thread 
- Resource safe. Exposes a number of primitives for working with resources
- Concurrent. Exposes a logical fiber threading model with support for joins and interrupts.


For more information see the [docs](./docs/README.md)
Also, there are a [number](./src/examples) [of](./examples/node) [examples](./examples/browser)

## Getting Started
```
import { IO, io } from "waveguide"
```

Consider simple examples for [node](./examples/node/src/index.ts) and the [browser](./examples/browser/src/index.tx)

## Constructing an IO
There are a number of ways of constructing IOs.
    - `io.succeed` -- create a successful IO
    - `io.failed` -- create a failed IO
    - `io.async` -- create an asynchronous effect based on callbacks
    - `io.suspend` -- create a synchronous efffect
There are also a number of functions to construct IOs from Promises and fp-ts tasks

## Using an IO
`IO<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with typeclass instances for Monad and parallel Applicative.
Furthermore, there are a several resource acquisition functions such as `bracket` and `onComplete` which guarantee IO actions happen in the fact of errors or interuption.
These respect interruptible state

## Resources
Any IO<E, A> may be safely used as a resource acquisition using the `bracket` or `bracketExit` combinators.
Once the resource is acquired, the release action will always happen. 
`bracketExit` is a more powerful form of `bracket` where the `Exit` of the resource use action is also available.

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

## Compared to...

### funfix
[funfix](https://github.com/funfix/funfix/) provides a whole suite of functional tools in its core such as either, option, and others.
In contrast, waveguide has a peer dependency on [fp-ts](https://github.com/gcanti/fp-ts/) for this machinery and exports instances for fp-ts typeclasses where appropriate.
Both use a similar encoding of higher kinded types based on the paper [Lightweight Higher Kinded Polymorphism](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf)

funfix provides several building block effect types like Eval and Future that posses fewer capabilities than the most powerfult type IO.
waveguide does not provide equivalents; there is only the IO type.
waveguide does not provide an equivalent to funfix's Scheduler abstraction, although there is a trampolining runtime that underlies waveguides runloop and is configurable.
Both waveguide and funfix optimistically run synchronous effects until the first asynchronous boundary.
In funfix can be customized by providing an `ExecutionModel` and one such use is to perform auto-batching to ensure that every n synchronous steps the runloop will suspend to give other fibers a chance to run.
By contrast, waveguide will never automatically insert a boundary because doing so could result in unexpected behavior
As a case in point, consider using IO.async to requestAnimationFrame in the browser. 
An auto-batched runloop could reduce render performance in non-obvious ways. 

Both waveguide and funfix allow for sub-programs to be raced. 
However, waveguide goes further and allows a sub-program to be reified into a fiber which can be managed.
This is the same machinery that waveguide uses internally to manage racing.

Waveguide and funfix allow registering of cleanup actions in the event of completion and interruption.
However, waveguide exposes `bracket` which guarantee that cleanup actions are run if a resource is acquired
`bracketExit` goes even further and allows the cleanup action to know how the action exited (interrupt, complete, error, etc.).

Waveguide also provides some concurrency primitives such as the Semaphore, Mutex, Deferred, Ref, and Queue which allow for coordination between multiple running fibers.
funfix does not provide equivalents.



