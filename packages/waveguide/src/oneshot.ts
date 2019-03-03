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
