// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { none, Option, some } from "fp-ts/lib/Option";

export class OneShot<A> {
  private value: Option<A> = none;
  // Track set state with a boolean.
  // This is important to make OneShot<void> work, which is needed to make Deferred<void> work
  private listeners: Array<(a: A) => void>;

  constructor() {
    this.listeners = [];
  }

  public set(value: A) {
    if (this.value.isSome()) {
      throw new Error("Bug: OneShot has already been set");
    }
    this.value = some(value);
    this.listeners.forEach((l) => l(value));
  }

  public count(): number {
    return this.listeners.length;
  }

  public isSet(): boolean {
    return this.value.isSome();
  }

  public isUnset(): boolean {
    return !this.isSet();
  }

  public listen(f: (a: A) => void): void {
    if (this.value.isSome()) {
      f(this.value.value);
    } else {
      this.listeners.push(f);
    }
  }

  public unlisten(f: (a: A) => void): void {
    this.listeners = this.listeners.filter((l) => l !== f);
  }

  public get(): Option<A> {
    return this.value;
  }

  public unsafeGet(): A {
    if (this.value.isSome()) {
      return this.value.value;
    }
    throw new Error("Bug: Cannot get from empty OneShot");
  }
}
