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

import { FunctionN } from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
import { IO } from "./io";
import * as io from "./io";
import { MutableStack } from "./support/mutable-stack";

/**
 * A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.
 *
 * This is a friendly monadic wrapper around bracketExit.
 */
export type Resource<E, A> =
  Pure<A> |
  Bracket<E, A> |
  Suspended<E, A>  |
  Chain<E, any, A>;

export interface Pure<A> {
  readonly _tag: "pure";
  readonly value: A;
}

export function pure<A>(value: A): Pure<A> {
  return {
    _tag: "pure",
    value
  };
}

export interface Bracket<E, A> {
  readonly _tag: "bracket";
  readonly acquire: IO<E, A>;
  readonly release: FunctionN<[A], IO<E, unknown>>;
}

export function bracket<E, A>(acquire: IO<E, A>, release: FunctionN<[A], IO<E, unknown>>): Bracket<E, A> {
  return {
    _tag: "bracket",
    acquire,
    release
  };
}

export interface Suspended<E, A> {
  readonly _tag: "suspend";
  readonly suspended: IO<E, Resource<E, A>>;
}

export function suspend<E, A>(suspended: IO<E, Resource<E, A>>): Suspended<E, A> {
  return {
    _tag: "suspend",
    suspended
  };
}

export interface Chain<E, L, A> {
  readonly _tag: "chain";
  readonly left: Resource<E, L>;
  readonly bind: FunctionN<[L], Resource<E, A>>;
}

export function chain<E, L, A>(left: Resource<E, L>, bind: FunctionN<[L], Resource<E, A>>): Chain<E, L, A> {
  return {
    _tag: "chain",
    left,
    bind
  };
}

export function map<E, L, A>(res: Resource<E, L>, f: FunctionN<[L], A>): Resource<E, A> {
  return chain(res, (r) => pure(f(r)));
}

export function zipWith<E, A, B, C>(resa: Resource<E, A>,
                                    resb: Resource<E, B>,
                                    f: FunctionN<[A, B], C>): Resource<E, C> {
  return chain(resa, (a) => map(resb, (b) => f(a, b)));
}

export function zip<E, A, B>(resa: Resource<E, A>, resb: Resource<E, B>): Resource<E, readonly [A, B]> {
  return zipWith(resa, resb, (a, b) => [a, b] as const);
}

export function ap<E, A, B>(resa: Resource<E, A>, resfab: Resource<E, FunctionN<[A], B>>): Resource<E, B> {
  return zipWith(resa, resfab, (a, f) => f(a));
}

export function ap_<E, A, B>(resfab: Resource<E, FunctionN<[A], B>>, resa: Resource<E, A>): Resource<E, B> {
  return zipWith(resfab, resa, (f, a) => f(a));
}

export function use<E, A, B>(res: Resource<E, A>, f: FunctionN<[A], IO<E, B>>): IO<E, B> {
  if (res._tag === "pure") {
    return f(res.value);
  } else if (res._tag === "bracket") {
    return io.bracket(res.acquire, res.release, f);
  } else if (res._tag === "suspend") {
    return io.chain(res.suspended, consume(f));
  } else {
    return use(res.left, (a) => use(res.bind(a), f));
  }
}

export function consume<E, A, B>(f: FunctionN<[A], IO<E, B>>): FunctionN<[Resource<E, A>], IO<E, B>> {
  return (r) => use(r, f);
}

export const URI = "Resource";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    Resource: Resource<L, A>;
  }
}

export const instances: Monad2<URI> = {
  URI,
  of: pure,
  map,
  ap: ap_,
  chain
} as const;
