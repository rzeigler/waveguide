// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IO } from "./io";

// tslint:disable:no-console

export function log(msg: string): IO<never, void> {
  return IO.eval(() => console.log(msg));
}
export function warn(msg: string): IO<never, void> {
  return IO.eval(() => console.warn(msg));
}
export function error(msg: string): IO<never, void> {
  return IO.eval(() => console.error(msg));
}
