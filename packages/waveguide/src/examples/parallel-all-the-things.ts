import "source-map-support/register";
import { IO } from "../index";

const io = [];
for (let i = 0; i < 10000; i++) {
  io.push(IO.of(i).yield_());
}

// io.map((i) => i.fork())
//   .reduce((f, s) => f.chain((f1) => s.chain((s2) => f1.join.map2(s2.join, (a, b) => a + b))))
//   .promised()
//   .then(() => console.log("done"))
//   .catch((e: Error) => {
//     console.error(e);
//     console.error(e.stack);
//   });
