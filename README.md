# Waveguide

Waveguide is a set of modules provides an effect type (IO) and concurrency primitives in Typescript.
IO abstracts over both synchronous and asynchronous effects and provides a resource tracking model and fiber based concurrency.
Inspired by projects like [Cats Effect](https://github.com/typelevel/cats-effect), and [ZIO](https://github.com/scalaz/scalaz-zio).

Feel free to raise an issue if you have any questions.
I'm also on available on the [slack fpchat](https://fpchat-invite.herokuapp.com/)

The provided packages are:
- [waveguide](./packages/waveguide/README.md) [![npm version](https://badge.fury.io/js/waveguide.svg)](https://badge.fury.io/js/waveguide) - the core types IO and Fiber as well as Ref, Deferred, Semaphore, and Mutex classes.
- [waveguide-fp-ts](./packages/waveguide-fp-ts/README.md) [![npm version](https://badge.fury.io/js/waveguide-fp-ts.svg)](https://badge.fury.io/js/waveguide-fp-ts) - [fp-ts](https://github.com/gcanti/fp-ts) typeclasses for IO
- [waveguide-node](./packages/waveguide-node/README.md) [![npm version](https://badge.fury.io/js/waveguide-node.svg)](https://badge.fury.io/js/waveguide-node) - useful utilities for node including a main function that interrupts on signals
- [waveguide-browser](./packages/waveguide-browser/README.md) [![npm version](https://badge.fury.io/js/waveguide-browser.svg)](https://badge.fury.io/js/waveguide-browser) - useful utilities for the browser including  a main function that interrupts on 'onunload'
