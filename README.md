# waveguide

[![npm version](https://badge.fury.io/js/waveguide.svg)](https://badge.fury.io/js/waveguide)
[![CircleCI](https://circleci.com/gh/rzeigler/waveguide.svg?style=svg)](https://circleci.com/gh/rzeigler/waveguide) 
[![Join the chat at https://gitter.im/waveguide-core/community](https://badges.gitter.im/waveguide-core/community.svg)](https://gitter.im/waveguide-core/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Waveguide is a set of modules provided datatypes for encoding effects in Typescript in the [fp-ts](https://github.com/gcanti/fp-ts) ecosystem inspired by scala projects such as [ZIO](https://github.com/scalaz/scalaz-zio) and [cats-effect](https://github.com/typelevel/cats-effect).

IO is:
- Lazy. Work is not done until explicitly asked for and interruption can be used to stop work that is no longer needed.
- Efficient. Asynchronous boundaries only occur where necessary. The runloop will execute as much work as it can before suspending.
- Interoperable. There are a functions to adapt Promises as well as the fp-ts effect types.
- Resource safe. Exposes a number of primitives for working with resources and guaranteeing cleanup.
- Concurrent. Exposes a logical fiber model with support for joins and interrupts. Write your code as a sequence of effects and communicate with other fibers rather than trying to juggle the state of all concurrent processes at once.

For more information see [the docs](https://rzeigler.github.io/waveguide)
For useful low level wrappers around node see [waveguide-node](https://rzeigler.github.io/waveguide-node)

waveguide's API is still very much in flux. 
If you have questions don't hesitate to ask them in the gitter.

## Compared to...

### [funfix](https://github.com/funfix/funfix/)
- funfix provides a whole suite of functional data structures while waveguide focuses strictly on IO.
- waveguide's primary type is IO, funfix has an equivalent but also exports several weaker types that encode limited types of effects
- waveguide does not provide an equivalent to funfix's ExecutionModel. Fairness can be controlled by explicitly yielding using shift or shiftAsync.
- funfix allows programs to be raced. waveguide allows simple racing, but it also allows launching a program as fibers that can be managed and interrupted independently.
- waveguide also provides data structures for communicating across fibers including Ref, Deferred, Semaphore, and Queue



