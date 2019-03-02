# Waveguide

Waveguide is a set of modules provides an effect type and concurrency primitives in Typescript.
Inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio).

The provided packages are:
- [waveguide](./packages/waveguide/readme.md) - the core data types
- [waveguide-fp-ts](./packages/waveguide-fp-ts/readme.md) - [fp-ts](https://github.com/gcanti/fp-ts) typeclasses for IO
- [waveguide-node](./packages/waveguide-node/readme.md) - useful utilities for node including a main function that interrupts on signals
- [waveguide-browser](./packages/waveguide-browser/readme.md) - useful utilities for the browser including  a main function that interrupts on 'onunload'
