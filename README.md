# Waveguide

Waveguide is a set of modules provides an effect type (IO) and concurrency primitives in Typescript.
IO abstracts over both synchronous and asynchronous effects and provides a resource tracking model and fiber based concurrency.
Inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio).

Feel free to raise an issue if you have any questions.
I'm also on available on the [slack fpchat](https://fpchat-invite.herokuapp.com/)

The provided packages are:
- [waveguide](./packages/waveguide/README.md) - the core types IO and Fiber as well as Ref, Deferred, Semaphore, and Mutex classes.
- [waveguide-fp-ts](./packages/waveguide-fp-ts/README.md) - [fp-ts](https://github.com/gcanti/fp-ts) typeclasses for IO
- [waveguide-node](./packages/waveguide-node/README.md) - useful utilities for node including a main function that interrupts on signals
- [waveguide-browser](./packages/waveguide-browser/README.md) - useful utilities for the browser including  a main function that interrupts on 'onunload'
