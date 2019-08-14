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
 * waveguide also exposes several concurrency structures, one of the most useful of which is semaphore.
 * Lets suppose you want to make at most 3 requests to a remote server at a time.
 * Doing all in parallel is fairly easy, doing 1 at a time is also fairly easy, but this is an interesting case where
 * 'semantic blocking' can be used to come into play 
 */
import { array } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as wave from "../src/io";
import { IO, RIO } from "../src/io";
import * as S from "../src/semaphore";
import { fetch, agent, time, main } from "./common";
import * as https from "https";
import * as consoleIO from "../src/console";
import * as resource from "../src/resource";

function query(q: string): RIO<https.Agent, Error, readonly [string, bigint]> {
    const get = pipe(
        fetch(`https://www.google.com/search?q=${q}`),
        time,
        wave.mapWith(x => [q, x[1]] as const)
    )
    return wave.applySecond(consoleIO.log(`starting ${q}`), wave.applyFirst(get, consoleIO.log(`finishing ${q}`)));
}

/**
 * Here we create an action that will create a semaphore.
 * See http://systemfw.org/scala-italy-2018/#/4/3 for an excellent description (in Scala) about why this should be an IO
 */
const sem: IO<never, S.Semaphore> = S.makeSemaphore(3);

const queries = ["c", "cplusplus", "java", "scala", "haskell", "purescript", "rust", "idris", "ada", "coq", "smalltalk", "swift", "kotlin"]

const queryTimes = 
    pipe(
        sem,
        // Here we use withPermit to require that we have exactly 3 in flight requests
        wave.chainWith((sem) => array.traverse(wave.parInstances)(queries, q => sem.withPermit(query(q)))),
        wave.chainWith((results) => consoleIO.log(results.toString())),
        wave.chainErrorWith((e) => consoleIO.error(`eeik! ${e}`))
    );


/**
 * This results in the following example output in the console
 * 
 * 
starting kotlin
starting swift
starting smalltalk
finishing smalltalk
starting coq
finishing kotlin
starting ada
finishing swift
starting idris
finishing coq
starting rust
finishing idris
starting purescript
finishing ada
starting haskell
finishing rust
starting scala
finishing purescript
starting java
finishing haskell
starting cplusplus
finishing scala
starting c
finishing java
finishing cplusplus
finishing c
c,913086810,cplusplus,596634401,java,831743612,scala,793182444,haskell,768789686,purescript,421581001,rust,832051966,idris,792947817,ada,1271403411,coq,602136105,smalltalk,590635041,swift,1087156638,kotlin,739227974
 */
main(resource.provideTo(agent, queryTimes));
