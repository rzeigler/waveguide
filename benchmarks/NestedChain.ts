/* global BigInt */
/* eslint @typescript-eslint/explicit-function-return-type:off */
import { Promise } from "bluebird"
import * as Fluture from "fluture"

import { FIO } from "fearless-io"
import * as wave from "../src/wave";

import { RunSuite } from "./internals/RunSuite"

const MAX = 1e4

const flutureMapper = (_: bigint) => Fluture.of(_ + BigInt(1))
const bluebirdMapper = (_: bigint) => Promise.resolve(_ + BigInt(1))
const fioMapper = (_: bigint) => FIO.of(_ + BigInt(1))
const waveMapper = (_: bigint) => wave.pure(_ + BigInt(1))

RunSuite(`NestedChain ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(bluebirdMapper)
    }

    return bird
  },
  fio: () => {
    let fio = FIO.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fio = fio.chain(fioMapper)
    }

    return fio
  },
  fluture: () => {
    let fluture = Fluture.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = fluture.chain(flutureMapper)
    }

    return fluture
  },
  waveguide: () => {
    let io: wave.IO<never, bigint> = wave.pure(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      io = wave.chain(io, waveMapper);
    }
    return io;
  }
})
