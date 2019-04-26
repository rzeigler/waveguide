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

import { MutableQueue } from "./mutable-queue";

export type Thunk = () => void;

/**
 * A trampolined execution environment.
 *
 * In order to drive rendezvouz between multiple running fibers it is important to be able to commence running a fiber
 * without growing the stack.
 * Otherwise, arbitrary numbers of constructs like deferred will cause unbounded stack growth.
 */
export class Trampoline {
  private running: boolean = false;
  private queue: MutableQueue<Thunk> = new MutableQueue();

  /**
   * Dispatch a thunk against this trampoline.
   *
   * If the trampoline is not currently active this immediately begins executing the thunk.
   * If the trampoline is currently active then the thunk will be appended to a queue
   * @param thunk
   */
  public dispatch(thunk: Thunk): void {
    this.queue.enqueue(thunk);
    if (!this.running) {
      this.run();
    }
  }

  /**
   * Is the trampoline currently executing?
   */
  public isRunning(): boolean {
    return this.running;
  }

  private run(): void {
    this.running = true;
    let next = this.queue.dequeue();
    while (next) {
      next();
      next = this.queue.dequeue();
    }
    this.running = false;
  }
}
