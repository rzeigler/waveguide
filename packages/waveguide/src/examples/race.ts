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
import { IO } from "../io";

let n = 0;

const io = IO.of(1000).delay(1000).applyFirst(IO.eval(() => n += 100))
    .race(IO.of(100).delay(100))
  .applyFirst(IO.delay(1000));

// tslint:disable:no-console
io.launch((result) => {
  console.log(`result was:`);
  console.dir(result);
  console.log(`n was ${n}`);
});
