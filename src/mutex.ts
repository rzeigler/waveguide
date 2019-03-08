// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
