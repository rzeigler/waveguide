import { expect } from 'chai';
import { of } from './index';

describe("Effect", () => {
  it("can be created", () => {
    expect(of(5)).to.not.be.null;
  })
});
