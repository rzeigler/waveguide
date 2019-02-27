import { IO } from "../io";
import { Ref } from "../ref";
import { Value } from "../result";
import { equiv } from "./lib.spec";

describe("Runtime", () => {
  describe("resource management", () => {
    it("should eval finally", () => {
      const ref = Ref.unsafeAlloc(42);
      const io = ref.modify((n) => n + 1).ensuring(ref.modify((n) => n - 1).yield_()).applySecond(ref.get);
      return equiv(io, new Value(42));
    });
    it("should release all finalizers in the face of interrupting", () => {
      const ref = Ref.unsafeAlloc(42);
      const add1 = ref.modify((n) => n + 1);
      const sub1 = ref.modify((n) => n - 1).void();
      const bracketer = (f: (n: number) => IO<never, never>) => add1.bracket((_) => sub1, f);
      // tslint:disable-next-line:no-shadowed-variable
      const nested = bracketer((_) => bracketer((_) => IO.never_()));
      const io = nested.fork()
        .chain((fiber) => fiber.interrupt.applySecond(ref.get));
      return equiv(io, new Value(42));
    });
    it("should prevent interrupts in critical sections", () => {
      const ref = Ref.unsafeAlloc(41);
      const add1 = ref.modify((n) => n + 1);
      const fiberIO = add1.delay(10).critical().applySecond(add1.delay(10));
      // Forking, then immediately interrupting should cause the first add to execute, but terminate the second
      const io = fiberIO.fork()
        .chain((fiber) => fiber.interrupt.yield_())
        .applySecond(ref.get);
      return equiv(io, new Value(42));
    });
    it("should cause resource acquisition to be a critical section", () => {
      const ref = Ref.unsafeAlloc(40);
      const add1 = ref.modify((n) => n + 1);
      const fiberIO = add1.delay(100).bracket((_) => add1.void(), (n) => IO.of(n));
      const io = fiberIO.fork()
        .chain((fiber) => fiber.interrupt.delay(10).applySecond(ref.get));
      return equiv(io, new Value(42));
    });
    it("should finalize resources even in the case of errors", () => {
      const ref = Ref.unsafeAlloc(42);
      const add1 = ref.modify((n) => n + 1).widenError<string>();
      const sub1 = ref.modify((n) => n - 1).void().widenError<string>();
      const fiberIO = add1.delay(20).bracket_((_) => sub1.delay(20), IO.failed("Boom!"));
      const io = fiberIO.fork()
        .chain((fiber) => fiber.join.attempt().applySecond(ref.get));
      return equiv(io, new Value(42));
    });
  });
});
