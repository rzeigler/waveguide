import { expect } from "chai";

import { IO } from "./io";
import { Abort, Raise } from "./result";

class Catch<A> {
  constructor(public readonly caught: A) { }
}
class Then<A> {
  constructor(public readonly then: A) { }
}

async function eqv<A>(p1: Promise<A>, p2: Promise<A>): Promise<{}> {
  const p1r = await p1.then((x) => new Then(x)).catch((e) => new Catch(e));
  const p2r = await p2.then((x) => new Then(x)).catch((e) => new Catch(e));
  expect(p1r).to.deep.equal(p2r);
  return {};
}

// Basic tests of sanity
describe("IO", () => {
  it("should produce complete values", () => {
    return eqv(IO.of(42).toPromise(), Promise.resolve(42));
  });
  it("should complete failures values", () => {
    return eqv(IO.fail(42).toPromise(), Promise.reject(new Raise(42)));
  });
  it("should complete abort values", () => {
    return eqv(IO.abort(42).toPromise(), Promise.reject(new Abort(42)));
  });
  it("should complete suspended values", () => {
    return eqv(IO.suspend(() => IO.of(42)).toPromise(), Promise.resolve(42));
  });
  it("should complete async values", () => {
    return eqv(IO.asyncDefer((cont) => {
      setTimeout(() => {
        cont(42);
      }, 10);
    }).toPromise(), Promise.resolve(42));
  });
  it("should complete async chain values", () => {
    // Use map because everything is internally implemented in terms of chain
    return eqv(IO.asyncDefer<number>((cont) => {
      setTimeout(() => {
        cont(41);
      }, 10);
    }).map((a) => a + 1).toPromise(), Promise.resolve(42));
  });
  it("should complete sync chain values", () => {
    return eqv(IO.defer<number>(() => 41).map((a) => a + 1).toPromise(), Promise.resolve(42));
  });
  it("should bypass chain on error", () => {
    return eqv(IO.fail("explode!").map((a: number) => a + 1).toPromise(), Promise.reject(new Raise("explode!")));
  });
  it("should bypass chainError on success", () => {
    return eqv(IO.of(41).mapError((x) => x).map((a) => a + 1).toPromise(), Promise.resolve(42));
  });
  // TODO: needs property tests also
  it("spawn/join should be equivalent to normal", () => {
    return eqv(
      IO.defer<number>(() => 41)
      .map((a) => a + 1)
      .spawn()
      .chain((f) => f.join)
      .toPromise(), Promise.resolve(42));
  });
  it("should allow recovery through chainError", () => {
    return eqv(
      IO.defer(() => 42)
        .widenError<string>()
        .chain((a) => IO.fail("" + 42))
        .widen<number>()
        .chainError((e) => IO.of(parseInt(e, 10)))
        .toPromise(), Promise.resolve(42));
  });
});
