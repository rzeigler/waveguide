import "source-map-support/register";
import { IO } from "../io";

let n = 0;

const io = IO.of(1000).delay(1000).applyFirst(IO.eval(() => n += 100))
    .race(IO.of(100).delay(100))
  .applyFirst(IO.delay(1000));

// tslint:disable:no-console
io.launch((result) => {
  console.log(`result was:`);
  console.dir(result);
  console.log(`n was ${n}`);
});
