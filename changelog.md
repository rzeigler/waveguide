# Waveguide - Changelog

## 0.2.0

* Adds nonblocking asynchronous queue in unbounded and bounded variants
* fork evaluation now starts the fiber on the next event loop tick. Makes recursively starting fibers with only synchronous actions (such as fork) stack safe.
* No longer multiple modules. Upon consideration, utilities for node or the browser probably want to version independently anyway.

## 0.1.0
* Initial release
