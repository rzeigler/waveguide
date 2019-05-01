// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { assert, asyncProperty, integer, string } from "fast-check";
import { left, right } from "fp-ts/lib/Either";
import { compose, identity } from "fp-ts/lib/function";
import { Aborted, Failed, Interrupted, Value } from "./exit";
import { io } from "./io";
import { adaptMocha, arbIO, eqvIO } from "./tools.spec";

// Tests for the io module
describe("io", () => {
  describe("#succeed", () => {
    it("should complete with a completed", (done) => {
      adaptMocha(io.succeed(42), new Value(42), done);
    });
  });
  describe("#fail", () => {
    it("should complete with a failed", (done) => {
      adaptMocha(io.fail("boom"), new Failed("boom"), done);
    });
  });
  describe("#abort", () => {
    it("should complete with an aborted", (done) => {
      adaptMocha(io.abort("boom"), new Aborted("boom"), done);
    });
  });
  describe("#interrupted", () => {
    it("should complete with an interrupted", (done) => {
      adaptMocha(io.interrupted, new Interrupted(), done);
    });
  });
  describe("#exitWith", () => {
    it("should complete with a completed when provided", (done) => {
      adaptMocha(io.completeWith(new Value(42)), new Value(42), done);
    });
    it("should complete with a failed when provided", (done) => {
      adaptMocha(io.completeWith(new Failed("boom")), new Failed("boom"), done);
    });
    it("should complete with an aborted when provided", (done) => {
      adaptMocha(io.completeWith(new Aborted("boom")), new Aborted("boom"), done);
    });
    it("should complete with an interrupted when provided", (done) => {
      adaptMocha(io.completeWith(new Interrupted()), new Interrupted(), done);
    });
  });
  describe("#effect", () => {
    it("should complete at some a success", (done) => {
      adaptMocha(io.effect(() => 42), new Value(42), done);
    });
  });
  describe("#suspend", () => {
    it("should complete with synchronous effects", (done) => {
      adaptMocha(io.suspend(() => io.succeed(42)), new Value(42), done);
    });
    it("should complete with asynchronous effects", (done) => {
      adaptMocha(io.suspend(() =>
        io.delay((callback) => {
          const handle = setTimeout(() => callback(42), 0);
          return () => { clearTimeout(handle); };
        })
      ), new Value(42), done);
    });
  });
  describe("#delay", () => {
    it("should complete with a success eventually", (done) => {
      adaptMocha(io.delay((callback) => {
        const handle = setTimeout(() => callback(42), 0);
        return () => { clearTimeout(handle); };
      }), new Value(42), done);
    });
  });
  describe("#async", () => {
    it("should complete with a success eventually", (done) => {
      adaptMocha(io.async((callback) => {
        const handle = setTimeout(() => callback(right(42)), 0);
        return () => { clearTimeout(handle); };
      }), new Value(42), done);
    });
    it("should complete with a failed eventually", (done) => {
      adaptMocha(io.async((callback) => {
        const handle = setTimeout(() => callback(left("boom")), 0);
        return () => { clearTimeout(handle); };
      }), new Failed("boom"), done);
    });
  });
  describe("#interrupted", () => {
    it("should complete with interrupted", (done) => {
      adaptMocha(io.interrupted, new Interrupted(), done);
    });
  });
});

// Tests for IO instances
describe("IO", () => {
  describe("#run", () => {
    it("should complete with an expected completion", (done) => {
      adaptMocha(io.succeed(42).run(), new Value(new Value(42)), done);
    });
    it("should complete with an expected failure", (done) => {
      adaptMocha(io.fail("boom").run(), new Value(new Failed("boom")), done);
    });
    it("shoudl complete with an expected abort", (done) => {
      adaptMocha(io.abort("boom").run(), new Value(new Aborted("boom")), done);
    });
    it("should complete with an expected interrupt", (done) => {
      adaptMocha(io.interrupted.run(), new Value(new Interrupted()), done);
    });
  });
  describe("laws", () => {
    // Property test utils
    // base on fp-ts-laws at https://github.com/gcanti/fp-ts-laws but adapter for the fact that we need to run IOs
    describe("Functor", function() {
      this.timeout(5000);
      it("- identity", () => {
        const arb = integer();
        return assert(asyncProperty(arbIO(arb), (fa) => eqvIO(fa.map(identity), fa)));
      });
      it("- composition", () => {
        const arb = string();
        const replicate = (s: string) => s + s;
        const length = (s: string) => s.length;
        return assert(asyncProperty(arbIO(arb),
          (fa) => eqvIO(
            fa.map(replicate).map(length),
            fa.map(compose(length, replicate))
          )
        ));
      });
    });
    describe("Apply", function() {
      this.timeout(5000);
      it("- associaive composition", () => {
        
      });
    });
  });
});
