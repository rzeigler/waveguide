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

import { Either, fold as foldEither } from "fp-ts/lib/Either";
import { FunctionN, Lazy } from "fp-ts/lib/function";
import { Option } from "fp-ts/lib/Option";
import { Cause, Done, done, Exit, interrupt as interruptExit, raise, ExitTag } from "./exit";
import { RIO, RIOTag } from "./wave";
import * as io from "./wave";
import { defaultRuntime, Runtime } from "./runtime";
import { Completable, completable } from "./support/completable";
import { MutableStack, mutableStack } from "./support/mutable-stack";

// It turns out th is is used quite often
type UnkIO = RIO<unknown, unknown, unknown>

export type RegionFrameType = InterruptFrame;
export type FrameType = Frame | FoldFrame | RegionFrameType;

interface Frame {
    readonly _tag: "frame";
    apply(u: unknown): UnkIO;
}

const makeFrame = (f: FunctionN<[unknown], UnkIO>): Frame => ({
    _tag: "frame",
    apply: f
});

interface FoldFrame {
    readonly _tag: "fold-frame";
    apply(u: unknown): UnkIO;
    recover(cause: Cause<unknown>): UnkIO;
}

const makeFoldFrame = (f: FunctionN<[unknown], UnkIO>,
    r: FunctionN<[Cause<unknown>], UnkIO>): FoldFrame => ({
    _tag: "fold-frame",
    apply: f,
    recover: r
});

interface InterruptFrame {
    readonly _tag: "interrupt-frame";
    apply(u: unknown): UnkIO;
    exitRegion(): void;
}

const makeInterruptFrame = (interruptStatus: MutableStack<boolean>): InterruptFrame => {
    return {
        _tag: "interrupt-frame",
        apply(u: unknown) {
            interruptStatus.pop();
            return io.pure(u) as UnkIO;
        },
        exitRegion() {
            interruptStatus.pop();
        }
    };
};

export interface Driver<R, E, A> {
    start(run: RIO<R, E, A>): void;
    interrupt(): void;
    onExit(f: FunctionN<[Exit<E, A>], void>): Lazy<void>;
    exit(): Option<Exit<E, A>>;
}

export function makeDriver<R, E, A>(runtime: Runtime = defaultRuntime): Driver<R, E, A> {
    let started = false;
    let interrupted = false;
    const result: Completable<Exit<E, A>> = completable();
    const frameStack: MutableStack<FrameType> = mutableStack();
    const interruptRegionStack: MutableStack<boolean> = mutableStack();
    let cancelAsync: Lazy<void> | undefined;


    function onExit(f: FunctionN<[Exit<E, A>], void>): Lazy<void> {
        return result.listen(f);
    }

    function exit(): Option<Exit<E, A>> {
        return result.value();
    }

    
    function isInterruptible(): boolean {
        const flag =  interruptRegionStack.peek();
        if (flag === undefined) {
            return true;
        }
        return flag;
    }

    function canRecover(cause: Cause<unknown>): boolean {
    // It is only possible to recovery from interrupts in an uninterruptible region
        if (cause._tag === ExitTag.Interrupt) {
            return !isInterruptible();
        }
        return true;
    }

    function handle(e: Cause<unknown>): RIO<unknown, unknown, unknown> | undefined {
        let frame = frameStack.pop();
        while (frame) {
            if (frame._tag === "fold-frame" && canRecover(e)) {
                return frame.recover(e);
            }
            // We need to make sure we leave an interrupt region or environment provision region while unwinding on errors
            if (frame._tag === "interrupt-frame") {
                frame.exitRegion();
            }
            frame = frameStack.pop();
        }
        // At the end... so we have failed
        result.complete(e as Cause<E>);
        return;
    }


    function resumeInterrupt(): void {
        runtime.dispatch(() => {
            const go = handle(interruptExit);
            if (go) {
                // eslint-disable-next-line
                loop(go);
            }
        });
    }

    function next(value: unknown): UnkIO | undefined {
        const frame = frameStack.pop();
        if (frame) {
            return frame.apply(value);
        }
        result.complete(done(value) as Done<A>);
        return;
    }

    function resume(status: Either<unknown, unknown>): void {
        cancelAsync = undefined;
        runtime.dispatch(() => {
            foldEither(
                (cause: unknown) => {
                    const go = handle(raise(cause));
                    if (go) {
                        /* eslint-disable-next-line */
                        loop(go);
                    }
                },
                (value: unknown) => {
                    const go = next(value);
                    if (go) {
                        /* eslint-disable-next-line */
                        loop(go);
                    }
                }
            )(status);
        });
    }

    function contextSwitch(op: FunctionN<[FunctionN<[Either<unknown, unknown>], void>], Lazy<void>>): void {
        let complete = false;
        const wrappedCancel = op((status) => {
            if (complete) {
                return;
            }
            complete = true;
            resume(status);
        });
        cancelAsync = () => {
            complete = true;
            wrappedCancel();
        };
    }

    function loop(go: UnkIO): void {
        let current: UnkIO | undefined = go;
        while (current && (!isInterruptible() || !interrupted)) {
            try {
                switch (current._tag) {
                    case RIOTag.Pure:
                        current = next(current.value);
                        break;
                    case RIOTag.Raised:
                        if (current.error._tag === ExitTag.Interrupt) {
                            interrupted = true;
                        }
                        current = handle(current.error);
                        break;
                    case RIOTag.Completed:
                        if (current.exit._tag === ExitTag.Done) {
                            current = next(current.exit.value);
                        } else {
                            current = handle(current.exit);
                        }
                        break;
                    case RIOTag.Suspended:
                        current = current.thunk();
                        break;
                    case RIOTag.Async:
                        contextSwitch(current.op);
                        current = undefined;
                        break;
                    case RIOTag.Chain:
                        frameStack.push(makeFrame(current.bind));
                        current = current.inner;
                        break;
                    case RIOTag.Collapse:
                        frameStack.push(makeFoldFrame(current.success, current.failure));
                        current = current.inner;
                        break;
                    case RIOTag.InterruptibleRegion:
                        interruptRegionStack.push(current.flag);
                        frameStack.push(makeInterruptFrame(interruptRegionStack));
                        current = current.inner;
                        break;
                    case RIOTag.AccessRuntime:
                        current = io.pure(current.f(runtime)) as UnkIO;
                        break;
                    case RIOTag.AccessInterruptible:
                        current = io.pure(current.f(isInterruptible())) as UnkIO;
                        break;
                    default:
                        throw new Error(`Die: Unrecognized current type ${current}`);
                }

            } catch (e) {
                current = io.raiseAbort(e) as UnkIO;
            }
        }
        // If !current then the interrupt came to late and we completed everything
        if (interrupted && current) {
            resumeInterrupt();
        }
    }

    function start(run: RIO<R, E, A>): void {
        if (started) {
            throw new Error("Bug: Runtime may not be started multiple times");
        }
        started = true;
        runtime.dispatch(() => loop(run as UnkIO));
    }

    function interrupt(): void {
        if (interrupted) {
            return;
        }
        interrupted = true;
        if (cancelAsync && isInterruptible()) {
            cancelAsync();
            resumeInterrupt();
        }
    }

    

    return {
        start,
        interrupt,
        onExit,
        exit
    };
}
