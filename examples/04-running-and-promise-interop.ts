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
import * as wave from "../src/wave";
import { Wave } from "../src/wave";
import { log } from "../src/console";
import { Lazy } from "fp-ts/lib/function";

/**
 * Waveguide has ways of interoperating with Promises on the receiving end
 * We can construct an Wave from a Promise.
 * We use a thunk instead of the Promise directly because Wave's are values and don't perform actions
 * If you use wave.fromPromise with a Promise that is already executing you are breaking referential transparency.
 * The resulting Wave is also uncancellable (per default es6 promises)
 * If you are using a Promise library that supports cancellation you will have to roll your own adapter which is not difficult
 */

const fromPromise: Wave<unknown, void> = 
    pipe(
      wave.fromPromise(() => Promise.resolve(41)),
      wave.mapWith((n) => n + 1), // there are odd interactions between unknown and never, so mapWith doesn't work
      wave.chainWith((n) => wave.covaryToE<unknown>()(log(`the answer is ${n}`))),
    );

/**
 * Now that we have an Wave from a promise, we can also run back to a promise
 */

const _p: Promise<void> = wave.runToPromise(fromPromise)
  .then(() => console.log("finished"));

/**
 * We don't have to run to a Promise or use the runtime like main does
 * We can, instead use run
 */
const _cancellation: Lazy<void> = wave.run(fromPromise, (result) => {
  // note that this will actually log before the "finished" above because waveguide's machinery doesn't require event loop ticks
  console.log("finished with " + JSON.stringify(result))
})
