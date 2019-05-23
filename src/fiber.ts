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

import { fold as foldOption, fromNullable, isSome, none, Option, some } from "fp-ts/lib/Option";
import { Driver } from "./driver";
import { Exit } from "./exit";
import { asyncTotal, completeWith, effect, IO, succeedWith, unit } from "./io";
import { Runtime } from "./runtime";

export interface Fiber<E, A> {
  /**
   * The name of the fiber
   */
  readonly name: Option<string>;
  /**
   * Send an interrupt signal to this fiber.
   *
   * The this will complete execution once the target fiber has halted.
   * Does nothing if the target fiber is already complete
   */
  readonly interrupt: IO<never, void>;
  /**
   * Await the result of this fiber
   */
  readonly wait: IO<never, Exit<E, A>>;
  /**
   * Join with this fiber.
   * This is equivalent to fiber.wait.chain(io.completeWith)
   */
  readonly join: IO<E, A>;
  /**
   * Poll for a fiber result
   */
  readonly result: IO<E, Option<A>>;
  /**
   * Determine if the fiber is complete
   */
  readonly isComplete: IO<never, boolean>;
}

function createFiber<E, A>(driver: Driver<E, A>, n?: string): Fiber<E, A> {
  const name = fromNullable(n);
  const sendInterrupt = effect(() => {
    driver.interrupt();
  });
  const wait = asyncTotal(driver.onExit);
  const interrupt = sendInterrupt.applySecond(wait).applySecond(unit);
  const join = wait.widenError<E>().chain((exit) => completeWith(exit));
  const result = effect(() => driver.exit())
    .widenError<E>()
    .chain((opt) => foldOption(() => succeedWith(none), (exit: Exit<E, A>) => completeWith(exit).map(some))(opt));
  const isComplete = effect(() => isSome(driver.exit()));
  return {
    name,
    wait,
    interrupt,
    join,
    result,
    isComplete
  };
}

export function makeFiber<E, A>(init: IO<E, A>, runtime: Runtime, name?: string): IO<never, Fiber<E, A>> {
  return effect(() => {
    const driver = new Driver(init, runtime);
    const fiber = createFiber(driver, name);
    driver.start();
    return fiber;
  });
}
