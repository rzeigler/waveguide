/* global BigInt */
/**
 * Created by tushar on 2019-05-09
 */
import {Promise} from "bluebird"
import * as Fluture from "fluture"

import {FIO} from "fearless-io"

import {inc} from "./internals/Inc"
import {RunSuite} from "./internals/RunSuite"
import * as wave from "../src/wave";

RunSuite("Map", {
    bluebird: () => Promise.resolve(BigInt(10)).then(inc),
    fio: () => FIO.of(BigInt(10)).map(inc),
    fluture: () => Fluture.of(BigInt(10)).map(inc),
    waveguide: () => wave.map(wave.pure(BigInt(1)), inc)
})
