import { IO } from "./io";
import { Semaphore } from "./semaphore";

export class Mutex {
  public static alloc(): IO<never, Mutex> {
    return Semaphore.alloc(1).map((s) => new Mutex(s));
  }

  public acquire: IO<never, void>;
  public release: IO<never, void>;

  private constructor(private readonly sem: Semaphore) {
    this.acquire = this.sem.acquire;
    this.release = this.sem.release;
  }
}
