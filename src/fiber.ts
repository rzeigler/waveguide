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
import { Driver, makeDriver } from "./driver";
import { Exit } from "./exit";
import { RIO, DefaultR } from "./io";
import * as io from "./io";
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
    readonly interrupt: RIO<DefaultR, never, void>;
    /**
   * Await the result of this fiber
   */
    readonly wait: RIO<DefaultR, never, Exit<E, A>>;
    /**
   * Join with this fiber.
   * This is equivalent to fiber.wait.chain(io.completeWith)
   */
    readonly join: RIO<DefaultR, E, A>;
    /**
   * Poll for a fiber result
   */
    readonly result: RIO<DefaultR, E, Option<A>>;
    /**
   * Determine if the fiber is complete
   */
    readonly isComplete: RIO<DefaultR, never, boolean>;
}

function createFiber<E, A>(driver: Driver<DefaultR, E, A>, n?: string): Fiber<E, A> {
    const name = fromNullable(n);
    const sendInterrupt = io.sync(() => {
        driver.interrupt();
    });
    const wait = io.asyncTotal(driver.onExit);
    const interrupt = io.applySecond(sendInterrupt, io.asUnit(wait));
    const join = io.chain(wait, (exit) => io.completed(exit));
    const result =
    io.chain(io.sync(() => driver.exit()),
        (opt) => foldOption(() => io.pure(none), (exit: Exit<E, A>) => io.map(io.completed(exit), some))(opt));
    const isComplete = io.sync(() => isSome(driver.exit()));
    return {
        name,
        wait,
        interrupt,
        join,
        result,
        isComplete
    };
}

export function makeFiber<E, A>(init: RIO<DefaultR, E, A>, runtime: Runtime, name?: string): RIO<DefaultR, never, Fiber<E, A>> {
    return io.sync(() => {
        const driver = makeDriver<DefaultR, E, A>(runtime);
        const fiber = createFiber(driver, name);
        driver.start({}, init);
        return fiber;
    });
}
