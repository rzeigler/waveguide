/* global BigInt */


import {Promise} from "bluebird"
import * as Fluture from "fluture"

import {FIO, UIO} from "fearless-io"

import {RunSuite} from "./internals/RunSuite"
import * as wave from "../src/wave";
import { IO } from "../src/wave";

/**
 * Normal Fibonacci Implementation
 */
export const fib = (n: bigint): bigint => {
    if (n < BigInt(2)) {
        return BigInt(1)
    }

    return fib(n - BigInt(1)) + fib(n - BigInt(2))
}

/**
 * Fluture based implementation
 */
export const fibFluture = (
    n: bigint
): Fluture.FutureInstance<never, bigint> => {
    if (n < BigInt(2)) {
        return Fluture.of(BigInt(1))
    }

    return fibFluture(n - BigInt(1)).chain(a => fibFluture(n - BigInt(2)).map(b => a + b))
}

/**
 * FIO based implementation
 */
export const fibFIO = (n: bigint): UIO<bigint> => {
    if (n < BigInt(2)) {
        return FIO.of(BigInt(1))
    }

    return fibFIO(n - BigInt(1)).chain(a => fibFIO(n - BigInt(2)).map(b => a + b))
}

/**
 * Bluebird based implementation
 */
export const fibBird = (n: bigint): Promise<bigint> => {
    if (n < BigInt(2)) {
        return Promise.resolve(BigInt(1))
    }

    return fibBird(n - BigInt(1)).then(a => fibBird(n - BigInt(2)).then(b => a + b))
}

export const fibWave = (n: bigint): IO<never, bigint> => {
    if (n < BigInt(2)) {
        return wave.pure(BigInt(1));
    }
    return wave.chain(fibWave(n - BigInt(1)),
        (a) => wave.map(fibWave(n - BigInt(2)),
            (b) => a + b));
}

const count = BigInt(20)
RunSuite(`Fibonacci: ${count}`, {
    bluebird: () => fibBird(count),
    fio: () => fibFIO(count),
    fluture: () => fibFluture(count),
    native: () => fib(count),
    waveguide: () => fibWave(count)
})
