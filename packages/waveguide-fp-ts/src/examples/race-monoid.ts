import { array } from "fp-ts/lib/Array";
import "source-map-support/register";
import { IO, terminal } from "waveguide";
import { parApplicative } from "../index";

const waits = [];
for (let i = 0; i < 10000; i++) {
  waits.push(IO.eval(() => Math.floor(Math.random() * 10000) + 100).chain((delay) => IO.delay(delay).as(delay)));
}

const all = array.sequence(parApplicative)(waits);
const first = array.reduce(waits, IO.never_() as IO<never, number>, (f, s) => f.race(s));

terminal.log("starting").applySecond(first)
  .chain((i) => terminal.log(`completed with ${i}`))
  // tslint:disable-next-line
  .launch((result) => console.log(result));
