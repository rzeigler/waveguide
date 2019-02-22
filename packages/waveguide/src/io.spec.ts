import { expect } from "chai";

import { some } from "fp-ts/lib/Option";
import { IO } from "./io";
import { Abort, Raise } from "./result";

class Catch<A> {
  constructor(public readonly caught: A) { }
}
class Then<A> {
  constructor(public readonly then: A) { }
}

async function eqv<E, A>(p1: IO<E, A>, p2: () => Promise<A>): Promise<{}> {
  const p1r = await p1.toPromise().then((x) => new Then(x)).catch((e) => new Catch(e));
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
    return eqv(IO.later<number>((cont) => {
      setTimeout(() => {
        cont(42);
      }, 10);
    }), () => Promise.resolve(42));
  });

  it("should complete async chain values", () => {
    // Use map because everything is internally implemented in terms of chain
    return eqv(IO.later<number>((cont) => {
      setTimeout(() => {
        cont(41);
      }, 10);
    }).map((a) => a + 1), () => Promise.resolve(42));
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
      .spawn()
      .widenError<{}>()
      .chain((f) => f.join), () => Promise.resolve(42));
  });

  it("should allow recovery through chainError", () => {
    return eqv(
      IO.sync<string, number>(() => 42)
        .chain((a) => IO.raise("" + 42))
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
});
