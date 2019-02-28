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

  public isUnset(): boolean {
    return this.value === undefined;
  }

  public listen(f: (a: A) => void): void {
    if (this.listeners.findIndex((l) => l === f) >= 0) {
      throw new Error("Bug: OneShot is already notifying that listener");
    }
    if (this.isSet()) {
      f(this.value!);
    } else {
      this.listeners.push(f);
    }
  }

  public unlisten(f: (a: A) => void): void {
    this.listeners = this.listeners.filter((l) => l !== f);
  }
}
