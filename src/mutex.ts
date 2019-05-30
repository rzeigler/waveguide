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

import { IO } from "./io";
import * as io from "./io";
import { makeSemaphore } from "./semaphore";

export interface Mutex {
  readonly acquire: IO<never, void>;
  readonly release: IO<never, void>;
  readonly available: IO<never, boolean>;
  withExclusion<E, A>(inner: IO<E, A>): IO<E, A>;
}

export const makeMutex: IO<never, Mutex> =
  io.map(makeSemaphore(1),
  (sem) => ({
    acquire: sem.acquire,
    release: sem.release,
    available: io.map(sem.available, (n) => n > 0),
    withExclusion<E, A>(inner: IO<E, A>): IO<E, A> {
      return sem.withPermit(inner);
    }
  }));
