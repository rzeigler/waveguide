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

import { IO } from "./io";
import { MutableStack } from "./mutable-stack";
import { Trampoline } from "./trampoline";

// The default global trampoline for everything
const trampoline = new Trampoline();

/**
 * The driver for executing IO actions.
 *
 * Provides a runtime and necessary state context to evaluate an IO
 */
export class Driver<E, A> {
  private started: boolean = false;

  constructor(private readonly init: IO<E, A>) {  }

  public start() {
    if (this.started) {
      throw new Error("Bug: Runtime may not be started multiple times");
    }
    trampoline.dispatch(() => this.loop(this.init));
  }

  private loop(next: IO<unknown, unknown>): void {
    return;
  }

  private step(io: IO<unknown, unknown>): IO<unknown, unknown> | undefined {
    return;
  }
}
