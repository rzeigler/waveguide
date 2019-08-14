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
import { IO, RIO, DefaultR } from "../src/io";
import { pipe } from "fp-ts/lib/pipeable";
import * as wave from "../src/io";
import * as resource from "../src/resource";
import * as consoleIO from "../src/console";
import * as https from "https";

/**
 * waveguide also has support for concurrency where it is possible to execute 2 IOs in parallel.
 * This can be done for a number of reasons.
 * 
 * Let us suppose that you are interested in the result of both IOs but they can proceed in parallel.
 * For this exercise we will "benchmark" google and bing and see which one can respond to a search result faster.
 * Lets start by writing a little timing helper
 * We want a way of getting the current time
 */
const now = wave.sync(() => process.hrtime.bigint());

/**
 * We also want a way of wrapping an IO so that we can see how long its execution took
 */
function time<R, E, O>(io: RIO<R, E, O>): RIO<R, E, readonly [O, bigint]> {
    // zipWith, zip happen in order with no parallelism
    return wave.zipWith(
        now,
        wave.zip(io, now),
        (start, [o, end]) => [o, end - start] as const
    );
}

/**
 * Also, recall the implementation of fetch that we had in 03-environment.ts
 */
import { fetch, agent } from "./common";

type Info = {host: string, q: string};
type TimeInfo = readonly [ Info, bigint ];
type CompareInfo = readonly [ TimeInfo, TimeInfo ];

function compare(q: string): RIO<https.Agent, Error, CompareInfo> {
    // We time the query
    const google = time(
        // We don't care so much about what the body is, just the host so we use as to coerce
        wave.as(
            fetch(`https://www.google.com/search?q=${q}`), 
            {host: "google", q}
        )
    );

    const bing = time(
        wave.as(
            fetch(`https://www.bing.com/search?q=${q}`),
            {host: "bing", q}
        )
    );
    // Now that we have both queries for our benchmark we can run them both to get the winner
    // We use parZip instead of zip
    // There are parallel versions of many combinators like zip, zipWith, applyFirst, applySecond, etc.
    // We also add an onInterrupted action which will be useful later
    return wave.onInterrupted(
        wave.parZip(google, bing), 
        consoleIO.log(`cancelling comparison of ${q}`)
    );
}


const rt: RIO<https.Agent, Error, void> =
    pipe(
        compare("referential+transparency"),
        wave.chainWith((results) => consoleIO.log(`${results[0][0].host} took ${results[0][1]}, ${results[1][0].host} took ${results[1][1]}`)),
        wave.chainErrorWith((e) => consoleIO.error(e.toString()))
    );

const versus = resource.provideTo(agent, rt)


/**
 * It is also possible to race many fibers in parallel so that we only get the first one completed
 * 
 */
const firstVersusIO = ["referential+transparency", "monad", "functor", "haskell", "scala", "purescript", "lenses"]
        .map(compare)
        // When we race IOs, the loser is automatically cancelled immediately
        .reduce((left, right) => wave.race(left, right));
const firstVersus = 
        resource.provideTo(agent, wave.chain(firstVersusIO,
            (results) => consoleIO.log(`winning query was ${results[0][0].q}`)));

wave.runR(wave.applySecond(versus, firstVersus), {});
