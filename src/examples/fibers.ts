// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { log } from "../console";

const fiberIO = (n: number) => log(`waiting 2000 ms -- ${n}`).yield_()
  .applySecond(log(`waited 2000 ms -- ${n}`).delay(2000));

const io = log("starting")
  .applySecond(
    fiberIO(1).fork().product(fiberIO(2).fork())
      .chain(([fiber1, fiber2]) =>
      log("forked")
        .applySecond(log("wait 100ms").delay(100))
        .applySecond(fiber2.interrupt)
        .applySecond(log("interrupted fiber2"))
        .applySecond(log("joining fiber1"))
        .applySecond(fiber1.join)
        .applySecond(log("fibers complete")))
  );

io.launch();
