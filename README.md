# waveguide

[![npm version](https://badge.fury.io/js/waveguide.svg)](https://badge.fury.io/js/waveguide)

Waveguide is a set of modules provided datatypes for encoding effects on Javascript platforms inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio). 
This is the core module which provides the effect type IO as well as a number of concurrency primatives.

IO is:
- Lazy. Work is not done until explicitly asked for and interruption can be used to stop work that is no longer needed.
- Unifies synchronous and asynchronous effects. The core runloop will run until an asynchronous boundary is encountered and then suspend. It is always possible to manually insert asynchronous boundaries manually to avoid blocking the main thread 
- Resource safe. Exposes a number of primitives for working with resources
- Concurrent. Exposes a logical fiber threading model with support for joins and interrupts.


For more information see the [docs](./docs/README.md)

## Getting Started
```
import { IO } from "waveguide"
```

## Constructing an IO
There are a number of ways of constructing IOs.
`IO.of` and `IO.failed` allow creating IOs from know values.
Additionally, `IO.eval` and `IO.suspend` create IOs from side effecting functions.
`IO.async` creates an asynchronous IO and `IO.assimilate` creates an IO from a promise factory.


## Using an IO
`IO<E, A>` is a monad and exposes the relevant functions in a naming scheme similar to [fp-ts](https://github.com/gcanti/fp-ts/) along with a number of typeclass instances for Monoid, Monad, and parallel Applicative.
Furthermore, there are a several resource acquisition functions such as `bracket` and `ensuring` which guarantee IO actions happen in the fact of errors or interuption.
These respect the 'critical' method which marks an IO as a critical section and as such should be interruptible.

## Fibers
An `IO<E, A>` may be converted to a fiber using `fork()`.
The result being an `IO<never, Fiber<E, A>>`.
The IO action is now running in the background and can be interrupted, waited, or joined.
`interrupt` sends an interrupt to a fiber causing it to halt once it leaves any critical sections it may be in.
A fiber will always run its finalizers even in the face of interruption.
`join` will halt the progress of the current fiber until the result of the target fiber is known.
`wait` will await the termination of a fiber either by interruption or completion. 
In particular, if you need to know when a fiber has finished its finalizers after being interrupted, you may use `wait`.

## Running
IOs are lazy so they don't actually do anything until they are interpreted.
`launch` will begin running a fiber and returns a cancellation action.
`promised` will return a promise of the result of the fiber and will not resolve in the face of interruption.
`promisedResult` will return a promise of a FiberResult.

## Concurrency Abstractions
Waveguide also provides Ref (synchronous mutable cell), Deferred (set once asynchronous cell), Semaphore, and an asynchronous Queue implementation.
