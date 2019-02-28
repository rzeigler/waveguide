# waveguide-main-node

```
import { main } from "waveguide-main-browser";
```

Provides `function main(io: IO<never, never>): void`. 
The IO should never produce and never fail (though aborts are still possible).
The IO will be interrupted on window 'onunload' and execute all finalizers before exiting.
