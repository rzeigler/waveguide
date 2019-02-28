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

function oscillate(n: number, div: HTMLDivElement): IO<never, never> {
  function go(current: number): IO<never, never> {
    return raf.applySecond(IO.eval(() => div.innerHTML = current.toString()))
      .chain((_) => current < n * n ? go(current + 1) : go(n));
  }
  return go(n);
}

const flashDiv = (number: number) =>
  createDiv.chain((div) =>
    appendDiv(div).applySecond(oscillate(number, div))
  );

const io = readInitial
  .chain((value) => flashDiv(value))
  .ensuring(incrementInitial);

main(io);
