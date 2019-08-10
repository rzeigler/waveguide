---
title: Compared To
nav_order: 2
---

## Compared to...

### [funfix](https://github.com/funfix/funfix/)
- funfix provides a whole suite of functional data structures while waveguide focuses strictly on IO.
- waveguide's primary type is RIO, funfix has an equivalent but also exports several weaker types that encode limited types of effects
- waveguide does not provide an equivalent to funfix's ExecutionModel. Fairness can be controlled by explicitly yielding using shift or shiftAsync.
- funfix allows programs to be raced. waveguide allows simple racing, but it also allows launching a program as fibers that can be managed and interrupted independently.
- waveguide also provides data structures for communicating across fibers including Ref, Deferred, Semaphore, and Queue
