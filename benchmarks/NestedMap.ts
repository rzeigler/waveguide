/**
 * Created by tushar on 2019-05-11
 */


/* global BigInt */

import {Promise} from "bluebird"
import * as Fluture from "fluture"

import {FIO} from "fearless-io"
import * as wave from "../src/wave";
import {inc} from "./internals/Inc"
import {RunSuite} from "./internals/RunSuite"

const MAX = 1e3

RunSuite(`NestedMap ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(inc)
    }

    return bird
  },
  fio: () => {
    let fio = FIO.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fio = fio.map(inc)
    }

    return fio
  },
  fluture: () => {
    let fluture = Fluture.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = fluture.map(inc)
    }

    return fluture
  },
  waveguide: () => {
    let io: wave.Wave<never, bigint> = wave.pure(BigInt(0));
    for (let i = 0; i < MAX; i++) {
      io = wave.map(io, inc)
    }
    return io;
  }
})
