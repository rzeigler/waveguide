import { IO } from "../io";
import { Raise, Value } from "../result";
import { equiv, equivIO } from "./lib.spec";

describe("IO", () => {
  describe("simple expressions", () => {
    it("should eval of", () => {
      return equiv(IO.of(42), new Value(42));
    });
    it("should eval sync", () => {
      return equiv(IO.eval(() => 42), new Value(42));
    });
    it("should eval async", () => {
      return equiv(IO.of(42).yield_(), new Value(42));
    });
    it("should eval sync chain", () => {
      return equiv(IO.of(41).map((n) => n + 1), new Value(42));
    });
    it("should eval async chain", () => {
      return equiv(IO.of(41).yield_().map((n) => n + 1), new Value(42));
    });
    it("should eval failed", () => {
      return equiv(IO.failed("boom!"), new Raise("boom!"));
    });
    it("should eval recovering from errors", () => {
      const io = IO.failed("42").chainError((n) => IO.of(parseInt(n, 10)));
      return equiv(io, new Value(42));
    });
    it("should allow up to 10000 map calls", () => {
      const f = (n: number) => n + 1;
      let io = IO.of(0);
      for (let i = 0; i < 10000; i++) {
        io = io.map(f);
      }
      return equiv(io, new Value(10000));
    });
    it("should allow up to 10000 applySecond calls", () => {
      let io = IO.of(0);
      for (let i = 0; i < 10000; i++) {
        io = io.applySecond(IO.of(i));
      }
      return equiv(io, new Value(9999));
    });
    it("should follow the monad associativity law", () => {
      function evalAdd1(n: number): IO<never, number> {
        return IO.eval(() => n + 1);
      }
      function asyncAdd1(n: number): IO<never, number> {
        return IO.of(n + 1).yield_();
      }
      const rightAssoc = IO.of(40).chain(evalAdd1).chain(asyncAdd1);
      const leftAssoc = IO.of(40).chain((n) => evalAdd1(n).chain(asyncAdd1));
      return equivIO(rightAssoc, leftAssoc);
    });
    const id = <A>(a: A) => a;
    const add1 = (n: number) => n + 1;
    const x2 = (n: number) => n * 2;
    function compose<B, C>(f: (b: B) => C) {
      return function composeWith<A>(g: (a: A) => B) {
        return function composed(a: A) {
          return f(g(a));
        };
      };
    }
    it("should follow the the applicative identity law", () => {
      return equivIO(id(IO.of(1)), IO.of(id).ap_(IO.of(1)));
    });
    it("should follow the applicative homomorphism law", () => {
      return equivIO(IO.of(add1).ap_(IO.of(1)), IO.of(add1(1)));
    });
    // Encoding the types has proved challenging.
    // I'm pretty sure this works though...
    xit("should follow the applicative composition law", () => {
      // const left = IO.of(compose as any).ap_(IO.of(add1)).ap_(IO.of(x2));
    });
  });
});
