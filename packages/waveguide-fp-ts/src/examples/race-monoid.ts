import { array } from "fp-ts/lib/Array";
import "source-map-support/register";
import { IO, terminal } from "waveguide";
import { getRaceMonoid } from "../index";

const waits = [];
for (let i = 0; i < 10000; i++) {
  waits.push(IO.eval(() => Math.floor(Math.random() * 10000) + 100).chain((delay) => IO.delay(delay).as(delay)));
}

const first = array.foldMap(getRaceMonoid<never, number>())(waits, (io) => io);

terminal.log("starting").applySecond(first)
  .chain((i) => terminal.log(`completed with ${i}`))
  // tslint:disable-next-line
  .launch((result) => console.log(result));
