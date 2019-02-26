import { filter, findFirst } from "fp-ts/lib/Array";

export class OneShot<A> {
  private value: A | undefined;
  private listeners: Array<(a: A) => void> = [];

  public set(value: A) {
    if (this.value) {
      throw new Error("Bug: OneShot has already been set");
    }
    this.value = value;
    this.listeners.forEach((l) => l(value));
  }

  public isSet(): boolean {
    return this.value !== undefined;
  }

  public listen(f: (a: A) => void): void {
    if (findFirst(this.listeners, (l) => l === f).isSome()) {
      throw new Error("Bug: OneShot is already notifying that listener");
    }
    if (this.isSet()) {
      f(this.value!);
    } else {
      this.listeners.push(f);
    }
  }

  public unlisten(f: (a: A) => void): void {
    this.listeners = filter(this.listeners, (l) => l === f);
  }
}
