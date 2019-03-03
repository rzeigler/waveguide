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

import { expect } from "chai";
import { IO } from "../io";
import { Raise, Result, Value } from "../result";

export async function equiv<E, A>(io: IO<E, A>, result: Result<E, A>): Promise<void> {
  const evaled = await io.promised().then((v) => new Value(v)).catch((e) => new Raise(e));
  expect(evaled).to.deep.equal(result);
  return;
}

export async function equivIO<E, A>(io: IO<E, A>, io2: IO<E, A>): Promise<void> {
  const r1 = await io.promised().then((v) => new Value(v)).catch((e) => new Raise(e));
  const r2 = await io2.promised().then((v) => new Value(v)).catch((e) => new Raise(e));
  expect(r1).to.deep.equal(r2);
  return;
}
