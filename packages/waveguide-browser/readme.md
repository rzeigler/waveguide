# waveguide-browser

[![npm version](https://badge.fury.io/js/waveguide-browser.svg)](https://badge.fury.io/js/waveguide-browser)

```
import { main } from "waveguide-browser";
```

Provides `function main(io: IO<never, never>): void`.
The IO should never produce and never fail (though aborts are still possible).
The IO will be interrupted on window 'onunload' and execute all finalizers before exiting.
