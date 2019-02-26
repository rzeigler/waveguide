import { expect } from "chai";
import { Either, left, right } from "fp-ts/lib/Either";
import { Cause } from "../cause";
import { IO } from "../io";

export async function equiv<E, A>(io: IO<E, A>, result: Either<Cause<E>, A>): Promise<void> {
  const evaled = await io.promised().then(right).catch(left);
  expect(evaled).to.deep.equal(result);
  return;
}

export async function equivIO<E, A>(io: IO<E, A>, io2: IO<E, A>): Promise<void> {
  const r1 = await io.promised().then(right).catch(left);
  const r2 = await io2.promised().then(right).catch(left);
  expect(r1).to.deep.equal(r2);
  return;
}
