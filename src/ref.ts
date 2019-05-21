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

import { boundMethod } from "autobind-decorator";
import { effect, IO } from "./io";
import { Fn1 } from "./support/types";

export interface Ref<A> {
  readonly get: IO<never, A>;
  set(a: A): IO<never, A>;
  update(f: Fn1<A, A>): IO<never, A>;
  modify<B>(f: Fn1<A, readonly [B, A]>): IO<never, B>;
}

class RefIO<A> implements Ref<A> {
  public readonly get: IO<never, A> = effect(() => this.value);

  constructor(private value: A) { }

  @boundMethod
  public set(a: A): IO<never, A> {
    return effect(() => {
      const prev = this.value;
      this.value = a;
      return prev;
    });
  }

  @boundMethod
  public update(f: Fn1<A, A>): IO<never, A> {
    return effect(() => {
      this.value = f(this.value);
      return this.value;
    });
  }

  @boundMethod
  public modify<B>(f: Fn1<A, readonly [B, A]>): IO<never, B> {
    return effect(() => {
      const [b, a] = f(this.value);
      this.value = a;
      return b;
    });
  }
}

/**
 * Creates an IO that will allocate a Ref.
 *
 */
export const makeRefC = <E = never>() => <A>(a: A): IO<E, Ref<A>> => effect(() => new RefIO(a));
export const makeRef = makeRefC();
