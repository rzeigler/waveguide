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

import { none, Option, some } from "fp-ts/lib/Option";
import { Completable } from "../core/completable";
import { IO, io } from "../core/io";

export interface Deferred<A> {
  readonly wait: IO<never, A>;
  readonly get: IO<never, Option<A>>;
  complete(a: A): IO<never, void>;
  tryComplete(a: A): IO<never, boolean>;
}

class DeferredIO<A> implements Deferred<A> {
  public readonly wait: IO<never, A>;
  public readonly get: IO<never, Option<A>>;

  private completable: Completable<A> = new Completable();
  constructor() {
    this.wait = io.delay((callback) =>
      this.completable.listen(callback)
    );
    this.get = io.effect(() => this.completable.value());
  }

  public complete(a: A): IO<never, void> {
    return io.effect(() => {
      this.completable.complete(a);
    });
  }

  public tryComplete(a: A): IO<never, boolean> {
    return io.effect(() => {
      if (this.completable.isComplete()) {
        return false;
      }
      this.completable.complete(a);
      return true;
    });
  }
}

/**
 * Creates an IO that will allocate a Deferred.
 *
 */
const allocC = <E = never>() => <A>(): IO<E, Deferred<A>> => io.effect(() => new DeferredIO<A>());
const alloc = allocC();

export const deferred = {
  allocC,
  alloc
};
