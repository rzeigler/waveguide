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

import { boundMethod } from "autobind-decorator";
import { FunctionN, Lazy } from "fp-ts/lib/function";
import { none, Option, some } from "fp-ts/lib/Option";
import * as o from "fp-ts/lib/Option";

/**
 * An initial empty receptacle for a value that may be set at most once
 */
export class Completable<A> {
  // Use option so that Completable<void> is possible
  private completed: Option<A> = none;
  private listeners: Array<(a: A) => void> = [];

  /**
   * Get the value that has been set
   */
  public value(): Option<A> {
    return this.completed;
  }

  /**
   * Is this completed filled
   */
  public isComplete(): boolean {
    return o.isSome(this.completed);
  }

  /**
   * Complete this with the value a
   *
   * Thrwos an exception if this is already complete
   * @param a
   */
  @boundMethod
  public complete(a: A): void {
    if (o.isSome(this.completed)) {
      throw new Error("Die: Completable is already completed");
    }
    this.set(a);
  }

  /**
   * Attempt to complete this with value a
   *
   * Returns true if this wasn't already set and false otherwise
   * @param a
   */
  @boundMethod
  public tryComplete(a: A): boolean {
    if (o.isSome(this.completed)) {
      return false;
    }
    this.completed = some(a);
    this.listeners.forEach((f) => f(a));
    return true;
  }

  /**
   * Register a listener for the completion of this with a value
   *
   * Returns an action that can be used to cancel the listening
   * @param f the callback
   */
  @boundMethod
  public listen(f: FunctionN<[A], void>): Lazy<void> {
    if (o.isSome(this.completed)) {
      f(this.completed.value);
    }
    this.listeners.push(f);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== f);
    };
  }

  @boundMethod
  private set(a: A): void {
    this.completed = some(a);
    this.listeners.forEach((f) => f(a));
  }
}
