import { IO, Runtime } from "waveguide";

export function main(io: IO<never, number>): void {
  const runtime = new Runtime<never, number>();
  process.on("SIGINT", () => {
    runtime.interrupt();
  });
  process.on("uncaughtException", (e) => {
    runtime.interrupt();
  });
  runtime.result.listen((result) => {
    if (result._tag === "interrupted") {
      process.exit(0);
    } else {
      if (result.result._tag === "value") {
        process.exit(result.result.value);
      } else {
        process.exit(-1);
      }
    }
  });
  runtime.start(io);
}
