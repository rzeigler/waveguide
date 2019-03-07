// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IO } from "../io";
import { Abort } from "../result";

export function assert<A>(a: A, prop: (a: A) => boolean, msg: string): IO<never, void> {
  if (prop(a)) {
    return IO.void();
  }
  return IO.aborted(new Abort(new Error(msg)));
}

export function isLt(min: number): (n: number) => boolean {
  return (n) => min < n;
}

export function isGt(max: number): (n: number) => boolean {
  return (n) => max > n;
}

export function isLte(min: number): (n: number) => boolean {
  return (n) => min >= n;
}

export function isGte(max: number): (n: number) => boolean {
  return (n) => max <= n;
}
