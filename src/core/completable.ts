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

import { none, Option, some } from "fp-ts/lib/Option";

export class Completable<A> {
  private completed: Option<A> = none;
  private listeners: Array<(a: A) => void> = [];

  public isComplete(): boolean {
    return this.completed.isSome();
  }

  public complete(a: A): void {
    if (this.completed.isSome()) {
      throw new Error("Defect: Completable is already completed");
    }
    this.completed = some(a);
    this.listeners.forEach((f) => f(a));
  }

  public listen(f: (a: A) => void): void {
    if (this.completed.isSome()) {
      f(this.completed.value);
    }
    this.listeners.push(f);
  }
}
