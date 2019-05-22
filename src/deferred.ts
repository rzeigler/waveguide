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

import { Exit } from "./exit";
import { asyncTotal, completeWith, effect, fail, interrupted, IO, succeed } from "./io";
import { Completable } from "./support/completable";

export interface Deferred<E, A> {
  readonly wait: IO<E, A>;
  interrupt: IO<never, void>;
  done(a: A): IO<never, void>;
  error(e: E): IO<never, void>;
  from(source: IO<E, A>): IO<never, void>;
}

export function makeDeferred<E, A, E2 = never>(): IO<E2, Deferred<E, A>> {
  return effect(() => {
    const completable: Completable<IO<E, A>> = new Completable();
    const wait = asyncTotal<IO<E, A>>((callback) =>
      completable.listen(callback)
    ).flatten();
    const interrupt = effect(() => {
      completable.complete(interrupted);
    });
    const done = (a: A): IO<never, void> => effect(() => {
      completable.complete(succeed(a));
    });
    const error = (e: E): IO<never, void> => effect(() => {
      completable.complete(fail(e));
    });
    const complete = (exit: Exit<E, A>): IO<never, void> => effect(() => {
      completable.complete(completeWith(exit));
    });
    const from = (source: IO<E, A>): IO<never, void> =>
      source.result().chain(complete).onInterrupted(interrupt);
    return {
      wait,
      interrupt,
      done,
      error,
      from
    };
  });
}
