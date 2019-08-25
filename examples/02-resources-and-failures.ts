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
 * As we saw in 01-introduction it is possible to use the bracket operators to 
 * ensure that cleanup actions happen in the face of failures.
 * Nested brackets can be somewhat awkward to work with.
 * Waveguide provides the Managed type that allows the bundling up of resource that can be consumed.
 * 
 * Here we will implement a 'cat' utility that reads from one file and writes to another
 */

import { openFile, closeFile, read, write, main } from "./common";
import { Managed } from "../src/managed";
import * as managed from "../src/managed";
import { pipe } from "fp-ts/lib/pipeable";
import * as o from "fp-ts/lib/Option";
import * as wave from "../src/wave";
import { Wave } from "../src/wave";


/**
 * First, lets define IOs that access argv so we can read the two files we need
 */
const argvN = (n: number): Wave<never, string | null> => wave.sync(() => process.argv[n] ? process.argv[n] : null);

const inFilePath = pipe(
    argvN(2),
    wave.lift(o.fromNullable),
    wave.chainWith((o) => wave.encaseOption(o, () => new Error("usage: node 02-resources-and-failures.js <in> <out>"))),
    wave.orAbort // here we use orAbort to force the error to a terminal one because there is nothing we can really do in the failure case
);

const outFilePath = pipe(
    argvN(3),
    wave.lift(o.fromNullable),
    wave.chainWith((o) => wave.encaseOption(o, () => new Error("usage: node 02-resources-and-failures.js <in> <out>"))),
    wave.orAbort
);

type Errno = NodeJS.ErrnoException;

/**
 * Now lets define the resources that define our input and output file handles.
 * We use managed.suspend as the outer call because we need to perform Wave in order to get the name of the file to open
 * This allows us to create a resource from an Wave of a resource
 */
const inFileHandle: Managed<Errno, number> = managed.suspend(
    wave.map(
        inFilePath,
        (path) =>
            // Once we have the path to open, we can create the resource itself
            // Bracket is similar to wave.bracket except it doesn't have consume logic
            // We are defering defining how we will consume this resource
            managed.bracket(
                openFile(path, "r"),
                closeFile
            )
    )
)

/**
 * This is basically the same as inFileHandle only we use "w" as the open mode
 */
const outFileHandle: Managed<Errno, number> = managed.suspend(
    wave.map(
        outFilePath,
        (path) =>
            managed.bracket(
                openFile(path, "w"),
                closeFile
            )
    )
)


/**
 * Managed are also little programs that can produce resources in a safe manner.
 * Thus, we can use chain and map to glue them together
 */
const handles: Managed<Errno, [number, number]> = 
    managed.chain(inFileHandle, (inh) => managed.map(outFileHandle, (outh) => [inh, outh]));
    // or you could use
    // again, not that this call to zip is perfectly safe because like Wave, 
    // Managed doesn't do anything until it is run
managed.zip(inFileHandle, outFileHandle)


/**
 * Now that we have our resources, we need a way of consuming them
 */
const cat = (blocksz: number) => (handles: [number, number]): Wave<Errno, void> => {
    const [inHandle, outHandle] = handles;

    function copy(): Wave<Errno, void> {
        return wave.chain(
            read(inHandle, blocksz),
            ([buffer, ct]) => 
                ct > 0 ? 
                    wave.applySecondL(
                        write(outHandle, buffer, ct), 
                        copy
                    ) : 
                    wave.unit
        );
    }
    return copy();
}

/**
 * We can now wire everything together
 */
const run: Wave<Errno, void> = managed.use(handles, cat(1028));

/**
 * An finally, we actually do something
 */
main(wave.orAbort(run));
