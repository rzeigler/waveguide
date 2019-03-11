// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IO } from "../io";
import { Ref } from "../ref";
import { FiberResult, interrupted, Raise, Value } from "../result";
import { equiv } from "./lib.spec";

describe("IO", () => {
  describe("resource management", () => {
    it("should eval ensuring", () => {
      const ref = Ref.unsafeAlloc(42);
      const io = ref.update((n) => n + 1).ensuring(ref.update((n) => n - 1).yield_()).applySecond(ref.get);
      return equiv(io, new Value(42));
    });
    it("should eval ensuring in the face of interrupts", () => {
      const ref = Ref.unsafeAlloc(41);
      const fiberIO = IO.never_().ensuring(ref.update((n) => n + 1));
      const io = fiberIO.fork().chain((fiber) => fiber.interrupt.yield_().applySecond(ref.get));
      return equiv(io, new Value(42));
    });
    describe("#bracket", () => {
      it("should release all finalizers in the face of interrupting", () => {
        const ref = Ref.unsafeAlloc(42);
        const add1 = ref.update((n) => n + 1);
        const sub1 = ref.update((n) => n - 1).void();
        const user = (f: (n: number) => IO<never, never>) => add1.bracket((_) => sub1, f);
        // tslint:disable-next-line:no-shadowed-variable
        const nested = user((_) => user((_) => IO.never_()));
        const io = nested.fork()
          .chain((fiber) => fiber.interrupt.applySecond(ref.get));
        return equiv(io, new Value(42));
      });
      it("should prevent interrupts in critical sections", () => {
        const ref = Ref.unsafeAlloc(41);
        const add1 = ref.update((n) => n + 1);
        const fiberIO = add1.delay(10).critical().applySecond(add1.delay(10));
        // Forking, then immediately interrupting should cause the first add to execute, but terminate the second
        const io = fiberIO.fork()
          .chain((fiber) => fiber.interrupt.yield_().applySecond(fiber.wait))
          .applySecond(ref.get);
        return equiv(io, new Value(42));
      });
      it("should cause resource acquisition to be a critical section", () => {
        const ref = Ref.unsafeAlloc(40);
        const add1 = ref.update((n) => n + 1);
        const fiberIO = add1.delay(100).bracket((_) => add1.void(), (n) => IO.of(n));
        const io = fiberIO.fork()
          .chain((fiber) => fiber.interrupt.delay(10).applySecond(fiber.wait).applySecond(ref.get));
        return equiv(io, new Value(42));
      });
      it("should finalize resources even in the case of errors", () => {
        const ref = Ref.unsafeAlloc(42);
        const add1 = ref.update((n) => n + 1).widenError<string>();
        const sub1 = ref.update((n) => n - 1).void();
        const fiberIO = add1.delay(20).within((_) => sub1.delay(20), IO.failed("Boom!"));
        const io = fiberIO.fork()
          .chain((fiber) => fiber.join.attempt().applySecond(ref.get));
        return equiv(io, new Value(42));
      });
    });
    describe("#bracketExit", () => {
      it("should perform releases normally and the finalizer should receive the exit status", () => {
        const ref = Ref.unsafeAlloc(42);
        const exitRef = Ref.unsafeAlloc<FiberResult<never, number> | undefined>(undefined);
        const acq = ref.update((n) => n + 1);
        const rel = (n: number, exit: FiberResult<never, number>) =>
          ref.set(n - 1).applySecond(exitRef.set(exit));
        const io = acq.bracketExit(rel, (n) => IO.of(n))
          .applySecond((ref.get.product(exitRef.get)));
        return equiv(io, new Value([42, new Value(43)] as any));
      });
      it("should perform releases on error and the finalizer should receive the exit status", () => {
        const ref = Ref.unsafeAlloc(42);
        const exitRef = Ref.unsafeAlloc<FiberResult<string, number> | undefined>(undefined);
        const acq = ref.update((n) => n + 1);
        const rel = (n: number, exit: FiberResult<string, number>) =>
          ref.set(n - 1).applySecond(exitRef.set(exit));
        const io = acq.widenError<string>().bracketExit(rel, (_) => IO.failed("boom!"))
          .resurrect()
          .applySecond((ref.get.product(exitRef.get)));
        return equiv(io, new Value([42, new Raise("boom!")] as any));
      });
      it("should perform release on interrupt and the finalizer should receive the exit status", () => {
        const ref = Ref.unsafeAlloc(42);
        const exitRef = Ref.unsafeAlloc<FiberResult<never, never> | undefined>(undefined);
        const acq = ref.update((n) => n + 1);
        const rel = (n: number, exit: FiberResult<never, never>) =>
          ref.set(n - 1).applySecond(exitRef.set(exit));
        const fiberIO = acq.bracketExit(rel, (_) => IO.never_());
        const io = fiberIO.fork().chain((fib) => fib.interruptAndWait.delay(20))
          .applySecond((ref.get.product(exitRef.get)));
        return equiv(io, new Value([42, interrupted] as any));
      });
    });
    it("should not invoke interrupted during normal execution", () => {
      const ref = Ref.unsafeAlloc(41);
      const add1 = ref.update(((n) => n + 1));
      const fiberIO = add1.interrupted(add1);
      const io = fiberIO.fork()
        .chain((fiber) => fiber.join.attempt().applySecond(ref.get));
      return equiv(io, new Value(42));
    });
    it("should not invoke interrupted during failure execution", () => {
      const ref = Ref.unsafeAlloc(42);
      const add1 = ref.update(((n) => n + 1));
      const fiberIO = IO.failed("boom").interrupted(add1);
      const io = fiberIO.fork()
        .chain((fiber) => fiber.join.attempt().applySecond(ref.get));
      return equiv(io, new Value(42));
    });
    it("should invoke interrupted during interrupts", () => {
      const ref = Ref.unsafeAlloc(41);
      const add1 = ref.update((n) => n + 1);
      const fiberIO = IO.never_().interrupted(add1);
      const io = fiberIO.fork()
        .chain((fiber) => fiber.interruptAndWait.delay(10).applySecond(ref.get));
      return equiv(io, new Value(42));
    });
  });
});
