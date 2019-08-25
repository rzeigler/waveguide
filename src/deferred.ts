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

import { Exit } from "./exit";
import { Wave } from "./wave";
import * as io from "./wave";
import { Completable, completable} from "./support/completable";

export interface Deferred<E, A> {
    readonly wait: Wave<E, A>;
    interrupt: Wave<never, void>;
    done(a: A): Wave<never, void>;
    error(e: E): Wave<never, void>;
    from<R>(source: Wave<E, A>): Wave<never, void>;
}

export function makeDeferred<E, A, E2 = never>(): Wave<E2, Deferred<E, A>> {
    return io.sync(() => {
        const c: Completable<Wave<E, A>> = completable();
        const wait = io.flatten(io.asyncTotal<Wave<E, A>>((callback) =>
            c.listen(callback)
        ));
        const interrupt = io.sync(() => {
            c.complete(io.raiseInterrupt);
        });
        const done = (a: A): Wave<never, void> => io.sync(() => {
            c.complete(io.pure(a));
        });
        const error = (e: E): Wave<never, void> => io.sync(() => {
            c.complete(io.raiseError(e));
        });
        const complete = (exit: Exit<E, A>): Wave<never, void> => io.sync(() => {
            c.complete(io.completed(exit));
        });
        const from = <R>(source: Wave<E, A>): Wave<never, void> => {
            const completed = io.chain<never, Exit<E, A>, void>(io.result(source), complete);
            const interruptor = interrupt as Wave<never, void>;
            return io.onInterrupted(completed, interruptor);
        }
        return {
            wait,
            interrupt,
            done,
            error,
            from
        };
    });
}
