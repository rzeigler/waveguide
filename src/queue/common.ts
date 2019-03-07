// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Option } from "fp-ts/lib/Option";
import { IO } from "../io";

export interface AsyncQueue<A> {
  readonly count: IO<never, number>;
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

export interface FiniteAsyncQueue<A> extends AsyncQueue<Option<A>> {
  close: IO<never, void>;
}
