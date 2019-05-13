# Waveguide - Changelog

## 0.4.0
* Large refactoring... the public interface very different from 0.3.0.
* Use a trampoline what rendevouzing across fibers instead of setTimeout(0). 
  This allows huge numbers of fibers to coordinate immediately rather than being throttled by an event loop tick per join
* The interruption model now follows current ZIO model of nested interruptible state regions.
  i.e. uninterruptible { interruptible { ... } applySecond b} would contained interruptible region.
* Interrupted is no a `never` error type similar to Abort.
* Simplify the driver step ADT most combinators are expressible using only Chain and Fold variants.
* There is now a bounded queue implementation
* There is now a resource monad that uses the bracketing IO combinators
* Add a number of adaptation functions from Promise and fp-ts that produce uninterruptible IOs
* async operators no longer take a ContextSwitch<E, A> instead returning to the form of Function1<Function1<Either<E, A>, void>, Lazy<void>>
  See trampoline changes...
* More granular racing and timeout combinators


## 0.3.0
* IO.async interface changes. IO.async now takes a ContextSwitch<E, A> -> void. ContextSwitch<E, A> allows control over when asynchronous values are delivered and whether interruption is possible.
* Adds Semaphore.tryAcquireN/tryAcquire.

## 0.2.0
* Adds nonblocking asynchronous queue in unbounded and bounded variants
* fork evaluation now starts the fiber on the next event loop tick. Makes recursively starting fibers with only synchronous actions (such as fork) stack safe.
* No longer multiple modules. Upon consideration, utilities for node or the browser probably want to version independently anyway.

## 0.1.0
* Initial release
