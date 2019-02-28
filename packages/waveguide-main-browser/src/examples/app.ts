import { IO, terminal, Value } from "waveguide";
import { main } from "../index";

const readItem = (key: string, orElse: string) => IO.eval(() => localStorage.getItem(key) || orElse);

const writeItem = (key: string, value: string) => IO.eval(() => localStorage.setItem(key, value));

const readInitial = readItem("tracked", "2").map((v) => parseInt(v, 10));
const incrementInitial = readInitial.chain((value) => writeItem("tracked", (value * 2).toString()));

const createDiv =
  IO.eval(() => document.createElement("div"));

const appendDiv = (div: HTMLDivElement) => IO.eval(() => document.body.appendChild(div));

const raf = IO.async<never, void>((callback) => {
  const id = requestAnimationFrame(() => {
    callback(new Value(undefined));
  });
  return () => {
    cancelAnimationFrame(id);
  };
});

const incrementMaxSpeed = (n: number, div: HTMLDivElement): IO<never, never> =>
  raf.applySecond(IO.eval(() => div.innerText = n.toString()))
    .chain((_) => incrementMaxSpeed(n * 2, div));

const flashDiv = (number: number) =>
  createDiv.chain((div) =>
    appendDiv(div).applySecond(incrementMaxSpeed(number, div))
  );

const io = readInitial
  .chain((value) => flashDiv(value))
  .ensuring(incrementInitial);

main(io);
