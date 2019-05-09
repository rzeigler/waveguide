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

import { boundMethod } from "autobind-decorator";
import { asyncTotal, completeWith, effect, fail, interrupted, IO, succeed } from "./io";
import { Completable } from "./support/completable";

export interface Deferred<E, A> {
  readonly wait: IO<E, A>;
  interrupt: IO<never, void>;
  succeed(a: A): IO<never, void>;
  fail(e: E): IO<never, void>;
  from(source: IO<E, A>): IO<never, void>;
}

class DeferredIO<E, A> implements Deferred<E, A> {
  public readonly wait: IO<E, A>;
  public readonly interrupt: IO<never, void>;

  private completable: Completable<IO<E, A>> = new Completable();
  constructor() {
    this.wait = asyncTotal<IO<E, A>>((callback) =>
      this.completable.listen(callback)
    ).flatten();

    this.interrupt = effect(() => {
      this.completable.complete(interrupted);
    });
  }

  @boundMethod
  public succeed(a: A): IO<never, void> {
    return effect(() => {
      this.completable.complete(succeed(a));
    });
  }

  @boundMethod
  public fail(e: E): IO<never, void> {
    return effect(() => {
      this.completable.complete(fail(e));
    });
  }

  @boundMethod
  public completeWith(result: IO<E, A>): IO<never, void> {
    return effect(() => {
      this.completable.complete(result);
    });
  }

  @boundMethod
  public from(source: IO<E, A>): IO<never, void> {
    return source.result()
      .chain((exit) => this.completeWith(completeWith(exit)))
      .onInterrupted(this.interrupt);
  }
}

/**
 * Creates an IO that will allocate a Deferred.
 *
 */
export function makeDeferred<E, A>(): IO<never, Deferred<E, A>> {
  return effect(() => new DeferredIO());
}

export const makeDeferredC = <E = never>() => <A>() => makeDeferred<E, A>();
