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

import { terminal } from "../terminal";

const fiberIO = (n: number) => terminal.log(`waiting 2000 ms -- ${n}`).yield_()
  .applySecond(terminal.log(`waited 2000 ms -- ${n}`).delay(2000));

const io = terminal.log("starting")
  .applySecond(
    fiberIO(1).fork().product(fiberIO(2).fork())
      .chain(([fiber1, fiber2]) =>
      terminal.log("forked")
        .applySecond(terminal.log("wait 100ms").delay(100))
        .applySecond(fiber2.interrupt)
        .applySecond(terminal.log("interrupted fiber2"))
        .applySecond(terminal.log("joining fiber1"))
        .applySecond(fiber1.join)
        .applySecond(terminal.log("fibers complete")))
  );

io.launch();
