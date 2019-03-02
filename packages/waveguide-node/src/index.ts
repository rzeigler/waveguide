import { IO, Runtime } from "waveguide";

export function main(io: IO<never, number>): void {
  const runtime = new Runtime<never, number>();
  const interrupt = () => {
    runtime.interrupt();
  };
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", interrupt);
  process.on("uncaughtException", (e) => {
    // tslint:disable-next-line
    console.error("uncaught exception: ", e);
    interrupt();
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
