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

import { left, right } from "fp-ts/lib/Either";
import { Aborted, Completed, Failed, Interrupted, io } from "./io";
import { mochafy } from "./tools.spec";

describe("io", () => {
  describe("#succeed", () => {
    it("should complete with a completed", (done) => {
      mochafy(io.succeed(42), new Completed(42), done);
    });
  });
  describe("#fail", () => {
    it("should complete with a failed", (done) => {
      mochafy(io.fail("boom"), new Failed("boom"), done);
    });
  });
  describe("#abort", () => {
    it("should complete with an aborted", (done) => {
      mochafy(io.abort("boom"), new Aborted("boom"), done);
    });
  });
  describe("#interrupted", () => {
    it("should complete with an interrupted", (done) => {
      mochafy(io.interrupted, new Interrupted(), done);
    });
  });
  describe("#exitWith", () => {
    it("should complete with a completed when provided", (done) => {
      mochafy(io.exitWith(new Completed(42)), new Completed(42), done);
    });
    it("should complete with a failed when provided", (done) => {
      mochafy(io.exitWith(new Failed("boom")), new Failed("boom"), done);
    });
    it("should complete with an aborted when provided", (done) => {
      mochafy(io.exitWith(new Aborted("boom")), new Aborted("boom"), done);
    });
    it("should complete with an interrupted when provided", (done) => {
      mochafy(io.exitWith(new Interrupted()), new Interrupted(), done);
    });
  });
  describe("#delay", () => {
    it("should complete with a success eventually", (done) => {
      mochafy(io.delay((callback) => {
        const handle = setTimeout(() => callback(42), 0);
        return () => { clearTimeout(handle); };
      }), new Completed(42), done);
    });
  });
  describe("#effect", () => {
    it("should complete at some a success", (done) => {
      mochafy(io.effect(() => 42), new Completed(42), done);
    });
  });
  describe("#suspend", () => {
    it("should complete with synchronous effects", (done) => {
      mochafy(io.suspend(() => io.succeed(42)), new Completed(42), done);
    });
    it("should complete with asynchronous effects", (done) => {
      mochafy(io.suspend(() =>
        io.delay((callback) => {
          const handle = setTimeout(() => callback(42), 0);
          return () => { clearTimeout(handle); };
        })
      ), new Completed(42), done);
    });
  });
  describe("#async", () => {
    it("should complete with a success eventually", (done) => {
      mochafy(io.async((callback) => {
        const handle = setTimeout(() => callback(right(42)), 0);
        return () => { clearTimeout(handle); };
      }), new Completed(42), done);
    });
    it("should complete with a failed eventually", (done) => {
      mochafy(io.async((callback) => {
        const handle = setTimeout(() => callback(left("boom")), 0);
        return () => { clearTimeout(handle); };
      }), new Failed("boom"), done);
    });
  });
});
