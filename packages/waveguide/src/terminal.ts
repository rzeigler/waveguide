import { IO } from "./io";

// tslint:disable:no-console

export class Terminal {
  public log(msg: string): IO<never, void> {
    return IO.eval(() => console.log(msg));
  }
  public warn(msg: string): IO<never, void> {
    return IO.eval(() => console.warn(msg));
  }
  public error(msg: string): IO<never, void> {
    return IO.eval(() => console.error(msg));
  }
}

export const terminal = new Terminal();
