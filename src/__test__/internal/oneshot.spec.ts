// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import { OneShot } from "../../internal/oneshot";

describe("OneShot", () => {
  it("should invoke continuations on set", () => {
    let result: string | undefined;
    const one = new OneShot<string>();
    one.listen((v) => {
      result = v;
    });
    one.set("b");
    expect(result).to.equal("b");
  });
  it("should allow unlistening", () => {
    let result: string | undefined;
    const one = new OneShot<string>();
    const listen = (v: string) => {
      result = v;
    };
    one.listen(listen);
    one.unlisten(listen);
    one.set("b");
    expect(result).to.equal(undefined);
  });
  it("should allow setting undefined as a value that trigger", () => {
    let fired = false;
    const one = new OneShot<undefined>();
    const listen = (_: void) => {
      fired = true;
    };
    one.listen(listen);
    one.set(undefined);
    expect(fired).to.equal(true);
  });
  it("should allow setting undefined as a value that triggers late listens", () => {
    let fired = false;
    const one = new OneShot<undefined>();
    const listen = (_: void) => {
      fired = true;
    };
    one.set(undefined);
    one.listen(listen);
    expect(fired).to.equal(true);
  });
});
