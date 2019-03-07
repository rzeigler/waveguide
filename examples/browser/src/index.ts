// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IO, Value } from "../../../src";

export function main(io: IO<never, never>): void {
  const interrupt = io.launch();
  window.addEventListener("unload", () => {
    interrupt();
  });
}

const readItem = (key: string, orElse: string) => IO.eval(() => localStorage.getItem(key) || orElse);

const writeItem = (key: string, value: string) => IO.eval(() => localStorage.setItem(key, value));

const readInitial = readItem("tracked", "2").map((v) => parseInt(v, 10));
const incrementInitial = readInitial.chain((value) => writeItem("tracked", (value * 2).toString()));

const createDiv =
  IO.eval(() => document.createElement("div"));

const appendDiv = (div: HTMLDivElement) => IO.eval(() => document.body.appendChild(div));

const currentTime: IO<never, number> = IO.eval(() => Date.now());

const raf: IO<never, number> = IO.async<never, void>((callback) => {
  const id = requestAnimationFrame(() => {
    callback(new Value(undefined));
  });
  return () => {
    cancelAnimationFrame(id);
  };
}).applySecond(currentTime);

function oscillate(n: number, div: HTMLDivElement): IO<never, never> {
  function go(longestDuration: number, prevTime: number, current: number): IO<never, never> {
    return raf.chain((curTime) => {
      const duration = curTime - prevTime;
      return IO.eval(() => div.innerHTML = `${current.toString()} -- ${curTime - prevTime}ms -- ${longestDuration}`)
        .chain((_) => current < n * n ?
          go(Math.max(longestDuration, duration), curTime, current + 1) :
          go(Math.max(longestDuration, duration), curTime, n));
    });
  }
  return currentTime.chain((startTime) => go(0, startTime, n));
}

const flashDiv = (number: number) =>
  createDiv.chain((div) =>
    appendDiv(div).applySecond(oscillate(number, div))
  );

const io = readInitial
  .chain((value) => flashDiv(value))
  .ensuring(incrementInitial);

main(io);
