import { array } from "fp-ts/lib/Array";
import "source-map-support/register";
import { IO, terminal } from "waveguide";
import { parApplicative } from "../index";

const waits = [];
for (let i = 0; i < 10000; i++) {
  waits.push(IO.of(i).delay(Math.floor(Math.random() * 1000)));
}

const wait = array.sequence(parApplicative)(waits);

terminal.log("starting").applySecond(wait)
  .chain((i) => terminal.log(`completed`))
  .launch((result) => console.log(result));
