import { IO } from "waveguide";
import { main } from "../index";

const readItem = (key: string, orElse: string) => IO.eval(() => localStorage.getItem(key) || orElse);

const writeItem = (key: string, value: string) => IO.eval(() => localStorage.setItem(key, value));

const documentWrite = (text: string) => IO.eval(() => {
  document.write(text);
});

const readValue = readItem("tracked", "a");
const doubleValue = readValue.chain((value) => writeItem("tracked", value + value));

const io = readValue
  .chain((value) => documentWrite(`value was: ${value}`).applySecond(IO.never_()).ensuring(doubleValue));

main(io);
