// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
