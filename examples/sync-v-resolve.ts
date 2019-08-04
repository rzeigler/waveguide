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

/* eslint-disable */
import { IO, DefaultR } from "../src/io";
import * as m from "../src/io";

function promise(log: boolean) {
    const unfold = (max: number) => (cur: number): Promise<number> =>
        max === cur ? Promise.resolve(max) : Promise.resolve(max).then((n) => unfold(max)(cur + 1).then((v) => v + n));

    const start = process.hrtime.bigint();
    return unfold(1000000)(0).then((result) => {
        if (log) {
            // tslint:disable-next-line
            console.log(process.hrtime.bigint() - start, result)
        }
    });

}

function io(log: boolean) {
    const unfold = (max: number) => (cur: number): IO<DefaultR, never, number> =>
        max === cur ? m.pure(max) : m.chain(m.pure(max), (n) => m.map(unfold(max)(cur + 1), (v) => v + n));

    const start = process.hrtime.bigint();
    return m.runToPromise(unfold(1000000)(0)).then((result) => {
        if (log) {
            // tslint:disable-next-line
            console.log(process.hrtime.bigint() - start, result)
        }
    });
}

let op: Promise<unknown> = Promise.resolve();
for (let i = 0; i < 20; i++) {
    op = op.then(() => promise(false));
}
op = op.then(() => promise(true));

for (let i = 0; i < 20; i++) {
    op = op.then(() => io(false));
}
op = op.then(() => io(true));
