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

import { Either, left, right } from "fp-ts/lib/Either";
import { IO, io } from "../core/io";
import { Dequeue } from "../support/dequeue";
import { Deferred, deferred } from "./deferred";
import { Ref, ref } from "./ref";

export interface Semaphore {
  readonly acquire: IO<never, void>;
  readonly release: IO<never, void>;

  acquireN(n: number): IO<never, void>;
  releaseN(n: number): IO<never, void>;
  withPermitsN<E, A>(n: number, io: IO<E, A>): IO<E, A>;
  withPermit<E, A>(n: IO<E, A>): IO<E, A>;
}

type Reservation = [number, Deferred<never, void>];
type State = Either<Dequeue<Reservation>, number>;

class SemaphoreImpl implements Semaphore {
  public readonly acquire: IO<never, void>;
  public readonly release: IO<never, void>;

  constructor(cell: Ref<State>) {
    this.acquire = this.acquireN(1);
    this.release = this.releaseN(1);
  }

  public acquireN(n: number): IO<never, void> {
    return io.abort("boom");
  }

  public releaseN(n: number): IO<never, void> {
    return io.abort("boom");
  }

  public withPermitsN<E, A>(n: number, inner: IO<E, A>): IO<E, A> {
    return io.abort("boom");
  }

  public withPermit<E, A>(inner: IO<E, A>): IO<E, A> {
    return this.withPermitsN(1, inner);
  }
}

function alloc(n: number): IO<never, Semaphore> {
  if (n >= 0) {
    ref.alloc<State>(right(n))
      .map((state) => new SemaphoreImpl(state) as any);
  }
  return io.abort(new Error("Die: semaphore permits may not be negative"));
}

export const semaphore = {
  alloc
} as const;
