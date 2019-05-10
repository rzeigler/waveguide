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
import { bracket, IO } from "./io";

export const URI = "Resource";
export type URI = typeof URI;

/**
 * A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.
 *
 * This is a friendly monadic wrapper around bracketExit.
 */
export type Resource<E, A> = Pure<E, A> | Bracket<E, A> | Suspend<E, A> | Chain<E, any, A>;

export class Pure<E, A> {
  constructor(public readonly a: A) { }

  public map<B>(f: Function1<A, B>): Resource<E, B> {
    return this.chain((a) => new Pure(f(a)));
  }

  public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> {
    return new Chain(this, f);
  }

  public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return f(this.a);
  }
}

export class Bracket<E, A> {
  constructor(public readonly acquire: IO<E, A>, public readonly release: Function1<A, IO<E, void>>) { }

  public map<B>(f: Function1<A, B>): Resource<E, B> {
    return this.chain((a) => new Pure(f(a)));
  }

  public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> {
    return new Chain(this, f);
  }

  public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return bracket(this.acquire, this.release, f);
  }
}

export class Suspend<E, A> {
  constructor(public readonly suspended: IO<E, Resource<E, A>>) { }

  public map<B>(f: Function1<A, B>): Resource<E, B> {
    return this.chain((a) => new Pure(f(a)));
  }

  public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> {
    return new Chain(this, f);
  }

  public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return this.suspended.chain((r) => r.use(f));
  }
}

export class Chain<E, L, A> {
  constructor(public readonly left: Resource<E, L>, public readonly f: Function1<L, Resource<E, A>>) { }

  public map<B>(f: Function1<A, B>): Resource<E, B> {
    return this.chain((a) => new Pure(f(a)));
  }

  public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> {
    return new Chain(this, f);
  }

  public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    return this.left.use((l) => this.f(l).use(f));
  }
}

export function of<E, A>(a: A): Resource<E, A> {
  return new Pure(a);
}

export function resource<E, A>(acquire: IO<E, A>, release: Function1<A, IO<E, void>>): Resource<E, A> {
  return new Bracket(acquire, release);
}

export function suspend<E, A>(eff: IO<E, Resource<E, A>>): Resource<E, A> {
  return new Suspend(eff);
}
