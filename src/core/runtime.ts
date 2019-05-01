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

import { Trampoline } from "./trampoline";

/**
 * An interface for the IO system runtime.
 *
 * Allows dispatching arbitrary blocks of code immediately or after some delay
 */
export interface Runtime {
  /**
   * Dispatch a thunk immediately.
   *
   * The default runtime trampolines this dispatch to for stack safety.
   * @param thunk the action to execute
   */
  dispatch(thunk: () => void): void;
  /**
   * Dispatch a thunk after some amount of time has elapsed.
   *
   * Returns an actions that may be used to cancel execution.
   * The default runtime delegates to setTimeout.
   * @param thunk the action to execute
   * @param ms delay in milliseconds
   */
  dispatchLater(thunk: () => void, ms: number): () => void;
}

class JsRuntime implements Runtime {
  private readonly trampoline: Trampoline = new Trampoline();

  public dispatch(thunk: () => void): void {
    this.trampoline.dispatch(thunk);
  }

  public dispatchLater(thunk: () => void, ms: number): () => void {
    const handle = setTimeout(() => this.dispatch(thunk), ms);
    return () => {
      clearTimeout(handle);
    };
  }
}

export const defaultRuntime: Runtime = new JsRuntime();