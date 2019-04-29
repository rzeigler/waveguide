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

// Tools for performing tests against IO with mocha

import { expect } from "chai";
import { IO, Exit } from "./io";

export function mochafy<E, A>(io: IO<E, A>, expected: Exit<E, A>, done: (a?: any) => void) {
  io.unsafeRun((result) => {
    try {
      expect(result).to.deep.equal(expected);
      done();
    } catch (e) {
      done(e);
    }
  });
}
