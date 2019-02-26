import { right } from "fp-ts/lib/Either";
import { IO, nothing, of } from "../io";
import { unsafeRef } from "../ref";
import { equiv } from "./lib.spec";

describe("Runtime", () => {
  describe("resource management", () => {
    it("should eval finally", () => {
      const ref = unsafeRef(42);
      const io = ref.modify((n) => n + 1).ensuring(ref.modify((n) => n - 1).shift()).applySecond(ref.get);
      return equiv(io, right(42));
    });
    it("should release all finalizers in the face of interrupting", () => {
      const ref = unsafeRef(42);
      const add1 = ref.modify((n) => n + 1);
      const sub1 = ref.modify((n) => n - 1).empty();
      const bracketer = (f: (n: number) => IO<never, never>) => add1.bracket((_) => sub1, f);
      // tslint:disable-next-line:no-shadowed-variable
      const nested = bracketer((_) => bracketer((_) => nothing));
      const io = nested.fork()
        .chain((fiber) => fiber.interrupt.applySecond(ref.get));
      return equiv(io, right(42));
    });
    it("should prevent interrupts in critical sections", () => {
      const ref = unsafeRef(41);
      const add1 = ref.modify((n) => n + 1);
      const fiberIO = add1.delay(10).critical().applySecond(add1.delay(10));
      // Forking, then immediately interrupting should cause the first add to execute, but terminate the second
      const io = fiberIO.fork()
        .chain((fiber) => fiber.interrupt.shift())
        .applySecond(ref.get);
      return equiv(io, right(42));
    });
    it("should cause resource acquisition to be a critical section", () => {
      const ref = unsafeRef(40);
      const add1 = ref.modify((n) => n + 1);
      const fiberIO = add1.delay(100).bracket((_) => add1.empty(), (n) => of(n));
      const io = fiberIO.fork()
        .chain((fiber) => fiber.interrupt.delay(10).applySecond(ref.get));
      return equiv(io, right(42));
    });
  });
});
