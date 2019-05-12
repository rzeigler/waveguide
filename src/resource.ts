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

import { Function1, Function2 } from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
import { bracket, IO } from "./io";
import { MutableStack } from "./support/mutable-stack";

// TODO: Switch this to use a wrapper class + internal ADT similar to IO
// This implementation style did not work out all all as the API surface area has grown

/**
 * A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.
 *
 * This is a friendly monadic wrapper around bracketExit.
 */
type ResourceADT<E, A> = Pure<E, A> | Bracket<E, A> | Suspend<E, A> | Chain<E, any, A>;

export class Resource<E, A> {
  constructor(private readonly step: ResourceADT<E, A>) { }

  public map<B>(f: Function1<A, B>): Resource<E, B> {
    return this.chain((a) => new Resource(new Pure(f(a))));
  }

  public zipWith<B, C>(other: Resource<E, B>, f: Function2<A, B, C>): Resource<E, C> {
    return this.chain((a) => other.map((b) => f(a, b)));
  }

  public zip<B>(other: Resource<E, B>): Resource<E, readonly [A, B]> {
    return this.zipWith(other, (a, b) => [a, b] as const);
  }

  public ap<B>(other: Resource<E, Function1<A, B>>): Resource<E, B> {
    return this.zipWith(other, (a, f) => f(a));
  }

  public ap_<B, C>(this: Resource<E, Function1<B, C>>, other: Resource<E, B>): Resource<E, C> {
    return this.zipWith(other, (f, b) => f(b));
  }

  public chain<B>(f: Function1<A, Resource<E, B>>): Resource<E, B> {
    return new Resource(new Chain(this, f));
  }

  public use<B>(f: Function1<A, IO<E, B>>): IO<E, B> {
    if (this.step._tag === "pure") {
      return f(this.step.a);
    } else if (this.step._tag === "bracket") {
      return this.step.acquire.bracketExit(this.step.release, f);
    } else if (this.step._tag === "suspend") {
      return this.step.suspended.chain((r) => r.use(f));
    } else {
      const s = this.step;
      return s.left.use((a) => s.bind(a).use(f));
    }
  }
}

class Pure<E, A> {
  public readonly _tag: "pure" = "pure";
  constructor(public readonly a: A) { }
}

class Bracket<E, A> {
  public readonly _tag: "bracket" = "bracket";
  constructor(public readonly acquire: IO<E, A>, public readonly release: Function1<A, IO<E, void>>) { }
}

class Suspend<E, A> {
  public readonly _tag: "suspend" = "suspend";
  constructor(public readonly suspended: IO<E, Resource<E, A>>) { }
}

class Chain<E, L, A> {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly left: Resource<E, L>, public readonly bind: Function1<L, Resource<E, A>>) { }
}

export function of<E, A>(a: A): Resource<E, A> {
  return new Resource(new Pure(a));
}

export function from<E, A>(acquire: IO<E, A>, release: Function1<A, IO<E, void>>): Resource<E, A> {
  return new Resource(new Bracket(acquire, release));
}

export function suspend<E, A>(eff: IO<E, Resource<E, A>>): Resource<E, A> {
  return new Resource(new Suspend(eff));
}

export const URI = "Resource";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    Resource: Resource<L, A>;
  }
}

const map = <L, A, B>(fa: Resource<L, A>, f: Function1<A, B>) => fa.map(f);
const ap = <L, A, B>(ff: Resource<L, Function1<A, B>>, fa: Resource<L, A>) => ff.ap_(fa);
const chain = <L, A, B>(fa: Resource<L, A>, f: Function1<A, Resource<L, B>>) => fa.chain(f);

export const resource: Monad2<URI> = {
  URI,
  of,
  map,
  ap,
  chain
} as const;
