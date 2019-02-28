# waveguide-main-node

```
import { main } from "waveguide-main-node";
```

Provides `function main(io: IO<never, number>): void`. 
The IO should return a status code and never fail, though aborts are possible.
The IO will be interrupted on SIGINT and execute all finalizers before exiting.
If a number is produced the the process will exit with that number.
On abort the proces will exit with -1.
