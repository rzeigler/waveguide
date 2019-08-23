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
import { RIO, DefaultR } from "./io";
import * as io from "./io";
import { Completable, completable} from "./support/completable";

export interface Deferred<E, A> {
    readonly wait: RIO<DefaultR, E, A>;
    interrupt: RIO<DefaultR, never, void>;
    done(a: A): RIO<DefaultR, never, void>;
    error(e: E): RIO<DefaultR, never, void>;
    from<R>(source: RIO<R, E, A>): RIO<R, never, void>;
}

export function makeDeferred<E, A, E2 = never>(): RIO<DefaultR, E2, Deferred<E, A>> {
    return io.sync(() => {
        const c: Completable<RIO<DefaultR, E, A>> = completable();
        const wait = io.flatten(io.asyncTotal<RIO<DefaultR, E, A>>((callback) =>
            c.listen(callback)
        ));
        const interrupt = io.sync(() => {
            c.complete(io.raiseInterrupt);
        });
        const done = (a: A): RIO<DefaultR, never, void> => io.sync(() => {
            c.complete(io.pure(a));
        });
        const error = (e: E): RIO<DefaultR, never, void> => io.sync(() => {
            c.complete(io.raiseError(e));
        });
        const complete = (exit: Exit<E, A>): RIO<DefaultR, never, void> => io.sync(() => {
            c.complete(io.completed(exit));
        });
        const from = <R>(source: RIO<R, E, A>): RIO<R, never, void> => {
            const completed = io.chain<R, never, Exit<E, A>, void>(io.result(source), complete);
            const interruptor = interrupt as RIO<R, never, void>;
            return io.onInterrupted(completed, interruptor);
        }

            // io.onInterrupted<R, E, A>(io.chain<R, E, Exit<E, A>, void>(io.result(source), complete), interrupt);
        return {
            wait,
            interrupt,
            done,
            error,
            from
        };
    });
}
