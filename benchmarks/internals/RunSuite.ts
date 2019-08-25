/* eslint @typescript-eslint/triple-slash-reference:off */
/* eslint @typescript-eslint/explicit-function-return-type:off */
/// <reference path="./Global.d.ts" />

/* tslint:disable: no-unbound-method */
import {Suite} from "benchmark"
import {FutureInstance} from "fluture"

import { Wave } from "../../src/wave";
import * as wave from "../../src/wave";
import {noop} from "fearless-io/src/internals/Noop"
import {UIO} from "fearless-io"
import {defaultRuntime} from "fearless-io/src/runtimes/DefaultRuntime"

import {PrintLn} from "./PrintLn"

export const fioRuntime = defaultRuntime()

export const RunSuite = (
    name: string,
    test: {
        bluebird(): PromiseLike<unknown>;
        fio(): UIO<unknown>;
        fluture(): FutureInstance<unknown, unknown>;
        waveguide(): Wave<never, unknown>;
        native?(): void;
    }
) => {
    PrintLn("##", name)
    PrintLn("```")
    const suite = new Suite(name)

    if (typeof test.native === "function") {
        suite.add("Native", () => {
            (test as {native(): void}).native()
        })
    }

    suite
        .add("waveguide", (cb: IDefer) => wave.run(test.waveguide(), () => cb.resolve()), {defer: true})
        .add(
            "FIO",
            (cb: IDefer) => fioRuntime.execute(test.fio(), () => cb.resolve()),
            {defer: true}
        )
        .add(
            "Fluture",
            (cb: IDefer) => test.fluture().fork(noop, () => cb.resolve()),
            {defer: true}
        )
        .add("bluebird", (cb: IDefer) => test.bluebird().then(() => cb.resolve()), {
            defer: true
        })
        .on("cycle", (event: Event) => {
            PrintLn(String(event.target))
        })

        .on("complete", function(this: Suite): void {
            PrintLn(
                "Fastest is " +
          this.filter("fastest")
              .map((i: {name: string}) => i.name)
              .join("") +
          "\n```"
            )
        })
        .run()
}
