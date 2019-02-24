import { IO } from "./io";

export function log(str: string): IO<never, void> {
  return IO.sync(() => {
    // tslint:disable-next-line
    console.log(str);
  });
}
