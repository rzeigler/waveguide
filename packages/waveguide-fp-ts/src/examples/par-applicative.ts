import { array } from "fp-ts/lib/Array";
import { IO, terminal } from "waveguide";
import { parApplicative } from "../index";

const waits = [];
for (let i = 0; i < 100; i++) {
  waits.push(IO.of(i).delay(100));
}

const wait = array.sequence(parApplicative)(waits);

terminal.log("starting").applySecond(wait).applySecond(terminal.log("done")).launch();
