import { expect } from "chai";

import { some } from "fp-ts/lib/Option";
import { log } from "./console";
import { IO } from "./io";
import { Ref } from "./ref";
import { Abort, Raise } from "./result";

class Catch<A> {
  constructor(public readonly caught: A) { }
}
class Then<A> {
  constructor(public readonly then: A) { }
}

async function eqv<E, A>(p1: IO<E, A>, p2: () => Promise<A>): Promise<{}> {
  const p1r = await p1.toPromise()[1].then((x) => new Then(x)).catch((e) => new Catch(e));
  const p2r = await p2().then((x) => new Then(x)).catch((e) => new Catch(e));
  expect(p1r).to.deep.equal(p2r);
  return {};
}

function rejector(e: any): () => Promise<any> {
  return () => Promise.resolve().then(() => Promise.reject(e));
}

// Basic tests of sanity
describe("IO", () => {
  it("should produce complete values", () => {
    return eqv(IO.of(42), () => Promise.resolve(42));
  });

  it("should complete failures values", () => {
    return eqv(IO.failure(42), rejector(new Raise(42)));
  });

  it("should complete abort values", () => {
    return eqv(IO.abort(42), rejector(new Abort(42)));
  });

  it("should complete suspended values", () => {
    return eqv(IO.suspend(() => IO.of(42)), () => Promise.resolve(42));
  });

  it("should complete async values", () => {
    return eqv(IO.of(42).delay(10), () => Promise.resolve(42));
  });

  it("should complete async chain values", () => {
    // Use map because everything is internally implemented in terms of chain
    return eqv(IO.of(41).delay(10).map((a) => a + 1), () => Promise.resolve(42));
  });

  it("should complete sync chain values", () => {
    return eqv(IO.sync(() => 41).map((a) => a + 1), () => Promise.resolve(42));
  });

  it("should bypass chain on error", () => {
    return eqv(IO.failure("explode!").map((a: number) => a + 1), rejector(new Raise("explode!")));
  });

  it("should bypass chainError on success", () => {
    return eqv(IO.of(41).mapError((x) => x).map((a) => a + 1), () => Promise.resolve(42));
  });

  // TODO: needs property tests also
  it("spawn/join should be equivalent to normal", () => {
    return eqv(
      IO.sync(() => 41)
      .map((a) => a + 1)
      .delay(10)
      .spawn()
      .widenError<{}>()
      .chain((f) => f.join), () => Promise.resolve(42));
  });

  it("should allow recovery through chainError", () => {
    return eqv(
      IO.sync<string, number>(() => 42)
        .chain((_a) => IO.raise("" + 42))
        .chainError((e) => IO.of<string, number>(parseInt(e, 10))), () => Promise.resolve(42));
  });

  it("should run all finalizers on success", () => {
    let n = 0;
    const acq = IO.sync(() => {
      n += 1;
    }).delay(10);
    const get = IO.sync(() => {
      return n;
    });
    const rel = IO.sync(() => {
      n -= 1;
    }).delay(10);

    const io = acq.bracket((_) => rel, (_) => acq.bracket((__) => rel, (__) => get));

    return eqv(io, () => Promise.resolve(2))
      .then(() => {
        expect(n).to.equal(0);
      });
  });

  it("should run all finalizers on error", () => {
    let n = 0;
    const acq = IO.sync<string, void>(() => {
      n += 1;
    }).delay(10);
    const rel = IO.sync<string, void>(() => {
      n -= 1;
    }).delay(10);

    const io = acq.bracket((_) => rel, (_) => acq.bracket((__) => rel, (__) => IO.raise("boom!")));

    return eqv(io, rejector(new Raise("boom!")))
      .then(() => {
        expect(n).to.equal(0);
      });
  });

  it("should run all finalizers on buggy finalizer", () => {
    let n = 0;
    const acq = IO.sync<string, void>(() => {
      n += 1;
    }).delay(10);
    const rel = IO.sync<string, void>(() => {
      n -= 1;
    }).delay(10);

    const io = acq.bracket((_) => rel, (_) => acq.bracket((__) => IO.raise("boom!"), (__) => IO.of(n)));

    return eqv(io, rejector(new Raise("boom!")))
      .then(() => {
        expect(n).to.equal(1);
      });
  });

  it("should run all finalizers on buggy finalizer during failure", () => {
    let n = 0;
    const acq = IO.sync<string, void>(() => {
      n += 1;
    }).delay(10);
    const rel = IO.sync<string, void>(() => {
      n -= 1;
    }).delay(10);

    const io = acq.bracket((_) => rel, (_) => acq.bracket((__) => IO.raise("boom!"), (__) => IO.raise("use boom!")));

    return eqv(io, rejector(new Raise("use boom!", some(new Raise("boom!")))))
      .then(() => {
        expect(n).to.equal(1);
      });
  });

  it("should execute a co-routine", () => {
    return eqv(IO.co(function*() {
      const i = yield IO.of(1).delay(10);
      const j = yield IO.of(2).delay(11);
      const k = yield IO.of(3).delay(12);
      return i + j + k;
    }), () => Promise.resolve(6));
  });

  it("should correctly tank if a non-IO value is yielded", () => {
    return IO.co(function*() {
      const i = yield IO.of(1).delay(10);
      const j = yield 5;
      const k = yield IO.of(3).delay(12);
      return i + j + k;
    }).toPromise()[1]
      .catch((e) => {
        expect(e.variant).to.equal("abort");
      });
  });

  it("should correctly allow termination", () => {
    const ref = Ref.of(0);
    const set10 = (r: Ref<number>) => IO.voided().delay(10)
      .applySecond(r.set(10));

    const io = ref.chain((r) =>
      set10(r).spawn()
        .chain((fiber) => fiber.cancel.shift())
        .applySecond(r.get.delay(10))
    );

    return eqv(io, () => Promise.resolve(0));
  });

  const add1 = (x: number) => x + 1;
  const sub1 = (x: number) => x - 1;

  it.only("should unwind finalizers correctly", () => {
    const io = Ref.of(0).chain((ref) => {
      const fiberSpec = ref.modify(add1).shift()
        .bracket((_) => ref.modify(sub1).shift().voided(), (_) => log("getting").applySecond(ref.get).delay(1000));
      return fiberSpec.spawn()
        .chain((fiber) => log("cancelling").applySecond(fiber.cancel))
        .chain((_) => ref.get.delay(10));
    });

    eqv(io, () => Promise.resolve(0));
  });
});
