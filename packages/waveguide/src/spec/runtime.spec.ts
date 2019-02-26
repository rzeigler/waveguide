import { expect } from "chai";
import { Either, left, right } from "fp-ts/lib/Either";
import { Cause, Raise } from "../cause";
import { failed, IO, of, sync } from "../io";
import { unsafeRef } from "../ref";

async function equiv<E, A>(io: IO<E, A>, result: Either<Cause<E>, A>): Promise<void> {
  const evaled = await io.promised().then(right).catch(left);
  expect(evaled).to.deep.equal(result);
  return;
}

async function equivIO<E, A>(io: IO<E, A>, io2: IO<E, A>): Promise<void> {
  const r1 = await io.promised().then(right).catch(left);
  const r2 = await io2.promised().then(right).catch(left);
  expect(r1).to.deep.equal(r2);
  return;
}

describe("Runtime", () => {
  describe("simple expressions", () => {
    it("should eval of", () => {
      return equiv(of(42), right(42));
    });
    it("should eval sync", () => {
      return equiv(sync(() => 42), right(42));
    });
    it("should eval async", () => {
      return equiv(of(42).shift(), right(42));
    });
    it("should eval sync chain", () => {
      return equiv(of(41).map((n) => n + 1), right(42));
    });
    it("should eval async chain", () => {
      return equiv(of(41).shift().map((n) => n + 1), right(42));
    });
    it("should eval failed", () => {
      return equiv(failed("boom!"), left(new Raise("boom!")));
    });
  });
  describe("fibers", () => {
    it("spawn/join should be equivalent to simple", () => {
      const base = of(42).delay(10);
      const fiber = base.fork().chain((f) => f.join);
      return equivIO(base, fiber);
    });
    it.only("should provide for termination", () => {
      const ref = unsafeRef(42);
      const handle = ref.set(-42).delay(100).applySecond(sync(() => {
        // tslint:disable-next-line
        console.log("wasn't killed?");
      })).fork();
      const io = handle.chain((fiber) => fiber.kill).applySecond(ref.get.delay(110));
      return equiv(io, right(42));
    });
  });
  describe("resource management", () => {
    it("should eval finally", () => {
      const ref = unsafeRef(42);
      const io = ref.modify((n) => n + 1).ensuring(ref.modify((n) => n - 1).shift()).applySecond(ref.get);
      return equiv(io, right(42));
    });
  });
});
