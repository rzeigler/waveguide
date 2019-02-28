# Waveguide

Waveguide is a set of modules provided datatypes for encoding effects on Javascript platforms inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio).
The core datatype IO has several notable properties including:

- IO is fully lazy. IO never does work until explicitly asked to.
- IO supports both synchronous and asynchronous effects. The run loop will not suspend until an asychronous effect is hit.
- IO has a fiber concurrency model with support for interrupts.
- IO has a bracketing resource acquisition and release model that is able to cope with errors and interrupts.
- IO is a monad and a bifunctor. Its full type is IO<E, A> and most methods are parallel to what is in [fp-ts](https://github.com/gcanti/fp-ts)

The provided packages are:
- [waveguide](./packages/waveguide/readme.md) - the core data types
- [waveguide-main-node](./packages/waveguide-main-node/readme.md) - a main function for node that interrupts on signals
- [waveguide-main-browser](./packages/waveguide-main-browser/readme.md) - a main function for node that interrupts on 'onunload'
- [waveguide-fp-ts](./packages/waveguide-fp-ts/readme.md) - [fp-ts](https://github.com/gcanti/fp-ts) typeclasses for IO
