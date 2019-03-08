// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IO } from "./io";

/**
 * A synchronous mutable reference cell that always contains a value
 */
export class Ref<A> {
  public static alloc<A>(a: A): IO<never, Ref<A>> {
    return IO.eval(() => Ref.unsafeAlloc<A>(a));
  }

  public static unsafeAlloc<A>(a: A): Ref<A> {
    return new Ref(a);
  }

  public get: IO<never, A> = IO.eval(() => this.a);
  constructor(private a: A) { }
  public set(a: A): IO<never, void> {
    return IO.eval(() => {
      this.a = a;
    });
  }
  public update(f: (a: A) => A): IO<never, A> {
    return IO.eval(() => {
      this.a = f(this.a);
      return this.a;
    });
  }

  public modify<B>(f: (a: A) => [B, A]): IO<never, B> {
    return IO.eval(() => {
      const [ret, next] = f(this.a);
      this.a = next;
      return ret;
    });
  }
}
