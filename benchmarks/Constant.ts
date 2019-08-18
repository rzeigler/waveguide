/**
 * Created by tushar on 2019-05-09
 */
import {Promise} from "bluebird"
import * as Fluture from "fluture"

import {FIO} from "fearless-io"
import * as wave from "../src/io";

import {RunSuite} from "./internals/RunSuite"

RunSuite("Constant", {
    bluebird: () => Promise.resolve(10),
    fio: () => FIO.of(10),
    fluture: () => Fluture.of(10),
    waveguide: () => wave.pure(10)
})
