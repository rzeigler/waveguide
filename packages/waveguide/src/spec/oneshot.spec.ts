import { expect } from "chai";

import { OneShot } from "../oneshot";

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
});
