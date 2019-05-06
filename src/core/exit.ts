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

import { Function1 } from "fp-ts/lib/function";

export type Exit<E, A> = Value<A> | Cause<E>;

export class Value<A> {
  public readonly _tag: "value" = "value";
  constructor(public readonly value: A) { }
  public fold<B>(failed: Function1<Cause<unknown>, B>,
                 succeeded: Function1<A, B>): B {
    return succeeded(this.value);
  }
}

export type Cause<E> = Failed<E> | Aborted | Interrupted;
export class Failed<E> {
  public readonly _tag: "failed" = "failed";
  constructor(public readonly error: E) { }
  public fold<B>(failed: Function1<Cause<E>, B>,
                 succeeded: Function1<unknown, B>): B {
    return failed(this);
  }
}

export class Aborted {
  public readonly _tag: "aborted" = "aborted";
  constructor(public readonly error: unknown) { }
  public fold<B>(failed: Function1<Cause<unknown>, B>,
                 succeeded: Function1<unknown, B>): B {
    return failed(this);
  }
}

export class Interrupted {
  public readonly _tag: "interrupted" = "interrupted";
  public fold<B>(failed: Function1<Cause<unknown>, B>,
                 succeeded: Function1<unknown, B>): B {
    return failed(this);
  }
}

// TODO: Monad and Bifunctor interface for Exit<E,A>
