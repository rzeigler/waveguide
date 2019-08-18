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

import { expect } from "chai";
import { mutableStack } from "../../src/support/mutable-stack";

describe("MutableStack", () => {
    describe("#pop", () => {
        it("returns undefined when empty", () => {
            const s = mutableStack<number>();
            expect(s.pop()).to.equal(undefined);
        });
        it("returns undefined when drains", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.pop();
            expect(s.pop()).to.equal(undefined);
        });
        it("returns elements in lifo order", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.push(2);
            expect(s.pop()).to.equal(2);
            expect(s.pop()).to.equal(1);
            expect(s.pop()).to.equal(undefined);
        });
        it("returns elements in lifo order with interleaved pushes", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.push(2);
            expect(s.pop()).to.equal(2);
            s.push(3);
            expect(s.pop()).to.equal(3);
            expect(s.pop()).to.equal(1);
            expect(s.pop()).to.equal(undefined);
        });
    });
    describe("#size/isEmpty", () => {
        it("returns 0 when empty", () => {
            const s = mutableStack<number>();
            expect(s.size()).to.equal(0);
            expect(s.isEmpty()).to.equal(true);
        });
        it("returns the size of the stack", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.push(2);
            expect(s.size()).to.equal(2);
            expect(s.isEmpty()).to.equal(false);
        });
        it("returns the size of the stack after pop", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.push(2);
            s.pop();
            expect(s.size()).to.equal(1);
            expect(s.isEmpty()).to.equal(false);
        });
    });
    describe("#peek", () => {
        it("returns undefined on empty", () => {
            const s = mutableStack();
            expect(s.peek()).to.equal(undefined);
        });
        it("returns the next item", () => {
            const s = mutableStack<number>();
            s.push(1);
            expect(s.peek()).to.equal(1);
            expect(s.pop()).to.equal(1);
            expect(s.isEmpty()).to.equal(true);
        });
        it("returns the next item after pop", () => {
            const s = mutableStack<number>();
            s.push(1);
            s.push(2);
            s.pop();
            expect(s.peek()).to.equal(1);
            expect(s.pop()).to.equal(1);
            expect(s.isEmpty()).to.equal(true);
        });
    });
});
