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

import { array } from "fp-ts/lib/Array";
import "source-map-support/register";
import { IO, terminal } from "waveguide";
import { getRaceMonoid } from "../index";

const waits = [];
for (let i = 0; i < 10000; i++) {
  waits.push(IO.eval(() => Math.floor(Math.random() * 10000) + 100).chain((delay) => IO.delay(delay).as(delay)));
}

const first = array.foldMap(getRaceMonoid<never, number>())(waits, (io) => io);

terminal.log("starting").applySecond(first)
  .chain((i) => terminal.log(`completed with ${i}`))
  // tslint:disable-next-line
  .launch((result) => console.log(result));
