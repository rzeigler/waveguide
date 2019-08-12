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

/**
 * So far, we have seen the IO type
 * IO is actually an alias for RIO<{}, E, A>
 * Remember we said earlier that you can think of IO<E, A> as equivalent to <A>() => Promise<A>
 * Well, that was a simplification. You can actually think of RIO<R, E, A> as equivalent to <R, A>(r: R) => Promise<A>
 * Relatedly, Resource<E, A> is actually an alias for Managed<{}, E, A> for cases when you need a context
 * to construct your resource
 * 
 * Any RIO can ask for its environment at any point.
 * Let see how this works by building an http fetch. 
 * You could always build this by using `wave.fromPromise(() => client(url))` but that is not fun
 * 
 * Lets start by creating a resource for an Agent
 */

import * as https from "https"
import * as http from "http";
import * as resource from "../src/resource";
import { Resource } from "../src/resource";
import * as wave from "../src/io";
import { IO, RIO } from "../src/io";
import { log } from "../src/console";
import { main } from "./common";

import { pipe } from "fp-ts/lib/pipeable";
import { left, right } from "fp-ts/lib/Either";

const agent: Resource<never, https.Agent> = resource.bracket(
    wave.sync(() => new https.Agent()),
    (agent) => wave.sync(() => agent.destroy())
);

/**
 * We can think of an IncomingMessage as something we can produce if we have an agent resource
 * @param url 
 */
function fetch(url: string): RIO<https.Agent, Error, Buffer> {
    return wave.encaseRIO((agent: https.Agent) => {
        const options = {agent};
        return wave.async<Error, Buffer>((callback) => {
            let cancelled = false;
            let response: http.IncomingMessage | undefined;
            http.get(url, options, (res) => {
                response = res;
                let buffers: Buffer[] = [];
                res.on('data', (chunk) => {
                    buffers.push(chunk);
                })
                res.on('end', () => {
                    callback(right(Buffer.concat(buffers)))
                });
                res.on('error', (e) => {
                    callback(left(e));
                });
            });
            return () => {
                cancelled = true;
                if (response) {
                    response.destroy();
                }
            };
        })
    })
}

/**
 * Here we see that we can construct a RIO that needs an Agent to execute
 */
const needsAgent: RIO<https.Agent, never, void> = 
    pipe(
        fetch("https://www.google.com"),
        wave.chainWith((buffer) => log(buffer.toString("utf-8").length.toString())),
        wave.chainErrorWith((e) => log(e.toString()))
    )

/**
 * There are several ways to provide environments to RIO's and make them ready for execution
 * You can use wave.provideEnv yourself or if you have a resource, you may use resource.provideTo
 */
const ready = resource.provideTo(agent, needsAgent)

/**
 * And then we launch
 */
main(ready);
