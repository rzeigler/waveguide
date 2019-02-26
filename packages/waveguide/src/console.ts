import { IO, sync } from "./io";

// tslint:disable:no-console

export interface ConsoleIO {
  log(msg: string): IO<never, void>;
  warn(msg: string): IO<never, void>;
  error(msg: string): IO<never, void>;
}

const impl: ConsoleIO = {
  log(msg: string): IO<never, void> {
    return sync(() => console.log(msg));
  },
  warn(msg: string): IO<never, void> {
    return sync(() => console.warn(msg));
  },
  error(msg: string): IO<never, void> {
    return sync(() => console.error(msg));
  }
};

export default impl;
