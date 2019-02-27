import { IO, Runtime } from "waveguide";

export function main(io: IO<never, never>): void {
  const runtime = new Runtime<never, never>();
  window.addEventListener("unload", () => {
    runtime.interrupt();
  });
  runtime.start(io);
}
