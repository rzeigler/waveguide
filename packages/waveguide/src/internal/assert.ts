import { IO } from "../io";
import { Abort } from "../result";

// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
