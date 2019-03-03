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

import "source-map-support/register";
import { IO } from "../index";

const io = [];
for (let i = 0; i < 10000; i++) {
  io.push(IO.of(i).yield_());
}

// io.map((i) => i.fork())
//   .reduce((f, s) => f.chain((f1) => s.chain((s2) => f1.join.map2(s2.join, (a, b) => a + b))))
//   .promised()
//   .then(() => console.log("done"))
//   .catch((e: Error) => {
//     console.error(e);
//     console.error(e.stack);
//   });
