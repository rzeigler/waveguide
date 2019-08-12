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
import { pipe } from "fp-ts/lib/pipeable";
import { left, right } from "fp-ts/lib/Either";

const agent = resource.bracket(
    wave.sync(() => new https.Agent()),
    (agent) => wave.sync(() => agent.destroy())
);

/**
 * We can think of an IncomingMessage as something we can produce if we have an agent resource
 * @param url 
 */
function fetch(url: string) {
    return wave.encaseRIO((agent: https.Agent) => {
        const options = {agent};
        return wave.async<Error, Buffer>((callback) => {
            let cancelled = false;
            let response: http.IncomingMessage | undefined;
            http.get(url, options, (res) => {
                response = res;
                let buffers: Buffer[] = [];
                res.on('data', (chunk) => {
                    console.log(chunk);
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
