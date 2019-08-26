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

import { Wave } from "./wave";
import * as io from "./wave";
import { makeSemaphore } from "./semaphore";

export interface Mutex {
    readonly acquire: Wave<never, void>;
    readonly release: Wave<never, void>;
    readonly available: Wave<never, boolean>;
    withExclusion<R, E, A>(inner: Wave<E, A>): Wave<E, A>;
}

export const makeMutex: Wave<never, Mutex> =
  io.map(makeSemaphore(1),
    (sem) => ({
      acquire: sem.acquire,
      release: sem.release,
      available: io.map(sem.available, (n) => n > 0),
      withExclusion<R, E, A>(inner: Wave<E, A>): Wave<E, A> {
        return sem.withPermit(inner);
      }
    }));
