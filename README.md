<h1 align=center>
<img src="logo/logotype.svg" width=50%>
</h1>

# waveguide

[![npm version](https://img.shields.io/npm/v/waveguide)](https://img.shields.io/npm/v/waveguide)
[![npm version next](https://img.shields.io/npm/v/waveguide/next)](https://img.shields.io/npm/v/waveguide/next)
[![CircleCI](https://circleci.com/gh/rzeigler/waveguide.svg?style=svg)](https://circleci.com/gh/rzeigler/waveguide) 
[![Join the chat at https://gitter.im/waveguide-core/community](https://badges.gitter.im/waveguide-core/community.svg)](https://gitter.im/waveguide-core/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Waveguide is a set of modules provided datatypes for describing effects. in Typescript in the [fp-ts](https://github.com/gcanti/fp-ts) ecosystem inspired by scala projects such as [ZIO](https://github.com/scalaz/scalaz-zio) and [cats-effect](https://github.com/typelevel/cats-effect). Waveguide allows you to communicate with the real world in a referentially transparent manner.

IO is:
- Lazy. Work is not done until explicitly asked for and interruption can be used to stop work that is no longer needed.
- Efficient. Asynchronous boundaries only occur where necessary. The runloop will execute as much work as it can before suspending.
- Interoperable. There are a functions to adapt Promises as well as the fp-ts effect types.
- Resource safe. Exposes a number of primitives for working with resources and guaranteeing cleanup.
- Concurrent. Exposes a logical fiber model with support for joins and interrupts. Write your code as a sequence of effects and communicate with other fibers rather than trying to juggle the state of all concurrent processes at once.

For more information see [the docs](https://rzeigler.github.io/waveguide) or [some examples](https://github.com/rzeigler/waveguide/blob/master/examples/overview.ts).

If you have questions don't hesitate to ask them in the gitter.


