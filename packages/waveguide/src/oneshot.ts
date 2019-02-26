import { filter, findFirst } from "fp-ts/lib/Array";
import { none, Option, some } from "fp-ts/lib/Option";

export class OneShot<A> {
  private value: Option<A> = none;
  private listeners: Array<(a: A) => void> = [];

  public set(a: A) {
    if (this.value.isSome()) {
      throw new Error("Bug: OneShot has already been set");
    }
    this.value = some(a);
    this.listeners.forEach((l) => l(a));
  }

  public isSet(): boolean {
    return this.value.isSome();
  }

  public listen(f: (a: A) => void): void {
    if (findFirst(this.listeners, (l) => l === f).isSome()) {
      throw new Error("Bug: OneShot is already notifying that listener");
    }
    this.listeners.push(f);
  }

  public unlisten(f: (a: A) => void): void {
    this.listeners = filter(this.listeners, (l) => l === f);
  }
}
