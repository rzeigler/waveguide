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

export class OneShot<A> {
  private value: A | undefined;
  // Track set state with a boolean.
  // This is important to make OneShot<void> work, which is needed to make Deferred<void> work
  private wasSet: boolean = false;
  private listeners: Array<(a: A) => void>;

  constructor() {
    this.listeners = [];
  }

  public set(value: A) {
    if (this.wasSet) {
      throw new Error("Bug: OneShot has already been set");
    }
    this.wasSet = true;
    this.value = value;
    this.listeners.forEach((l) => l(value));
  }

  public count(): number {
    return this.listeners.length;
  }

  public isSet(): boolean {
    return this.wasSet;
  }

  public isUnset(): boolean {
    return !this.isSet();
  }

  public listen(f: (a: A) => void): void {
    if (this.isSet()) {
      f(this.value!);
    } else {
      this.listeners.push(f);
    }
  }

  public unlisten(f: (a: A) => void): void {
    this.listeners = this.listeners.filter((l) => l !== f);
  }

  public get(): A | undefined {
    return this.value;
  }
}
