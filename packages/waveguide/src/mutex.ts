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
import { Semaphore } from "./semaphore";

export class Mutex {
  public static alloc(): IO<never, Mutex> {
    return Semaphore.alloc(1).map((s) => new Mutex(s));
  }

  public static unsafeAlloc(): Mutex {
    return new Mutex(Semaphore.unsafeAlloc(1));
  }

  public acquire: IO<never, void>;
  public release: IO<never, void>;

  private constructor(private readonly sem: Semaphore) {
    this.acquire = this.sem.acquire;
    this.release = this.sem.release;
  }

  public withPermit<E, A>(io: IO<E, A>): IO<E, A> {
    return this.sem.withPermit(io);
  }
}
