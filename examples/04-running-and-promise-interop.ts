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
/* eslint no-console:off */

import { pipe } from "fp-ts/lib/pipeable";
import * as wave from "../src/io";
import { IO } from "../src/io";
import { log } from "../src/console";
import { Lazy } from "fp-ts/lib/function";

/**
 * Waveguide has ways of interoperating with Promises on the receiving end
 * We can construct an IO from a Promise.
 * We use a thunk instead of the Promise directly because IO's are values and don't perform actions
 * If you use wave.fromPromise with a Promise that is already executing you are breaking referential transparency.
 * The resulting IO is also uncancellable (per default es6 promises)
 * If you are using a Promise library that supports cancellation you will have to roll your own adapter which is not difficult
 */

const fromPromise: IO<never, void> = 
    pipe(
        wave.fromPromise(() => Promise.resolve(41)),
        wave.lift(n => n + 1),
        wave.chainWith((n) => log(`the answer is ${n}`)),
        // note that the E of a fromPromise is unkown because we do not have type information about the reject
        wave.chainErrorWith((e: unknown) => log("could not compute the answer"))
    )

/**
 * Now that we have an IO from a promise, we can also run back to a promise
 */

const p: Promise<void> = wave.runToPromiseR(fromPromise, {})
    .then(() => console.log("finished"));

/**
 * We don't have to run to a Promise or use the runtime like main does
 * We can, instead use run
 */
const cancellation: Lazy<void> = wave.runR(fromPromise, {}, (result) => {
    // note that this will actually log before the "finished" above because waveguide's machinery doesn't require event loop ticks
    console.log("finished with " + JSON.stringify(result))
})
