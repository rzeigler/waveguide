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

import * as wave from "../src/wave"
import { IO } from "../src/wave";
import { log } from "../src/console";
import * as fs from "fs";
import { left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * An IO is a description of program that can be run to produce a result or possibly fail.
 * In this way, it is conceptually similar to the type <A>() => Promise<A>.
 * It allows use to interact with the real world without side effects because an IO doesn't 
 * do anything on its own.
 * 
 * Here, we produce a synchronous effect that when executed will read the pid of the process.
 * Process ids never change (so this is being very defensive) but we wrap it in IO because this will 
 * produce a different result from program execution to program execution so in the strictest sense 
 * it is not referentially transparent.
 */
const pid = wave.sync(() => process.pid)


/**
 * We can also describe asynchronous programs using the async combinator
 * Here we open a file handle which is an asynchronous operation.
 * The async combinator accepts a function that will receive a callback from Either<E, A> => void and returns a cancellation action
 * Waveguide has pervasive support for cancellation; however, once we ask node to open a file there is no way of cancelling the action.
 * So, instead, we return a no-op implementation for the cancellation action and mark the entire io as uninterruptible.
 * This ensures the file begins opening, it will complete and we don't leak resources.
 * 
 */
const openFile = (path: string, flags: string): IO<NodeJS.ErrnoException, number> => wave.uninterruptible(
    wave.async((callback) => {
        fs.open(path, flags, 
            (err, fd) => {
                if (err) {
                    callback(left(err))
                } else {
                    callback(right(fd))
                }
            }
        )
        return () => {};
    }));


/**
 * Here we close a file handle
 */
const closeFile = (handle: number): IO<NodeJS.ErrnoException, void> => wave.uninterruptible(
    wave.async((callback) => {
        fs.close(handle, (err) => {
            if (err) {
                callback(left(err))
            } else {
                callback(right(undefined))
            }
        })
        return () => {};
    }));

/**
 * We can also use a file handle to write content
 */
const write = (handle: number, content: string): IO<NodeJS.ErrnoException, number> => wave.uninterruptible(
    wave.async((callback) => {
        fs.write(handle, content, (err, written) => {
            if (err) {
                callback(left(err))
            } else {
                callback(right(written));
            }
        })
        return () => {};
    })
)

/**
 * Effect types are all about working with statements as though they were values.
 * We can package these 3 operations up into a resource safe file writing mechanism to manage the file handle resource
 */
const writeToFile = (path: string, content: string): IO<NodeJS.ErrnoException, void> => 
    pipe(
        wave.bracket(openFile(path, "w"), closeFile, (handle) => write(handle, content)),
        /**
         * Here, we use the wave.asUnit function to discard the result of a previous wave. 
         * We are saying we want the effects but don't care about the value it produced
         */
        wave.asUnit
    );
            

/**
 * The true power of waveguide (and other IO monads) is that we can treat statements like values
 * We can manipulate them and stitch them together in a side-effect free fashion.
 * Chain stitches together IOs so that the result of the first IO is used to create the IO to continue with.
 * Here we are going to create an IO that uses the result of pid to write a process file
 */

const writePidFile: IO<NodeJS.ErrnoException, void> = wave.chain(pid, (p) => writeToFile("pid", p.toString()));

const deletePidFile: IO<NodeJS.ErrnoException, void> = wave.uninterruptible(wave.async((callback) => {
    fs.unlink("pid", (err) => {
        if (err) {
            callback(left(err));
        } else {
            callback(right(undefined));
        }
    })
    return () => {};
}));

const getTime = wave.sync(() => new Date());

/**
 * We can access the pid and get the current time and then log the two.
 * Chain can work for arbitrary many IOs.
 * If you dislike the stairstep that is happening here, check out fp-ts-contrib's Do which 
 * waveguide works with and makes the stairstep go away
 */
const logPid: IO<NodeJS.ErrnoException, void> = 
    wave.chain(pid, 
        (p) => wave.chain(getTime,
            (now) => log(`its ${now} and the pid is still ${p}`))
    )

/**
 * Again, because IOs are just data structures, we can manipulate them like values.
 * We can, for instance construct an IO that repeatedly executes an IO on an interval
 */
function repeatEvery<E, A>(io: IO<E, A>, s: number): IO<E, A> {
    // We use chain here for the laziness because this is an infinitely sized structure
    return wave.applySecondL(wave.delay(io, s * 1000), () => repeatEvery(io, s));
}

const logPidForever = repeatEvery(logPid, 1);

/**
 * IO also expose handling cancellation and errors in a safe fashion.
 * Here we are going to create an IO that writes the pid file, logs the pid repeatedly forever, 
 * but is sure to delete the pid file
 */
const run = wave.chainError(
    wave.onComplete(
        wave.applySecond(writePidFile, logPidForever),
        deletePidFile
    ),
    /**
     * We can also handle the errors that we produce to continue the computation. Here we just log
     */
    (e) => log(`something went wrong: ${e}`)
)

/**
 * We haven't actually done anything yet.
 * While IO provides helpful things like run, runToPromise, and friends here we will drive the run loop outselves
 * and wire process signals to IOs interruption mechanism
 * 
 * In the future, this will be in the waveguide-node and waveguide-browser packages (the implementation is different per platform)
 * but it is presented here so you can see what is happening.
 * 
 * wave.run could also be used to achieve something similar, but here we invoke the driver ourselves to make sure we 
 * can wire the process signals before we start executing the action.
 */
import { makeDriver } from "../src/driver";
import { ExitTag } from "../src/exit";
function main(io: IO<never, void>): void {
    // We need a driver to run the io
    const driver = makeDriver<wave.DefaultR, never, void>();
    // If we receive signals, we should interrupt
    // These will cause the runloop to switch to its interrupt handling
    process.on("SIGINT", () => driver.interrupt());
    process.on("SIGTERM", () => driver.interrupt());
    // If the driver exits, we should terminate the process
    driver.onExit((e) => {
        // We don't worry about the raise case because the type of main says you must have handled your errors
        if (e._tag === ExitTag.Abort) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
    driver.start({}, io);
}

/**
 * Now that we have a 'main' function, we can execute our IO.
 * Notice how the pid file exists while the process is active but is gracefully cleared up at shutdown
 * This file is built by npm run test-build to ./build/examples/01-introduction.js
 */
main(run);
