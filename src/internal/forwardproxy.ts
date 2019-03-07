// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export class ForwardProxy {
  private invoked: boolean = false;
  private action: (() => void) | undefined;

  public invoke(): void {
    this.invoked = true;
    if (this.action) {
      this.action();
    }
  }

  public fill(action: () => void): void {
    this.action = action;
    if (this.invoked) {
      this.action();
    }
  }
}
