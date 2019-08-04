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
import { Monad3 } from "fp-ts/lib/Monad";
import { IO } from "./io";
import * as io from "./io";

/**
 * A Resource<E, A> is a type that encapsulates the safe acquisition and release of a resource.
 *
 * This is a friendly monadic wrapper around bracketExit.
 */
export type Resource<R, E, A> =
  Pure<A> |
  Bracket<R, E, A> |
  Suspended<R, E, A>  |
  Chain<R, E, any, A>; // eslint-disable-line @typescript-eslint/no-explicit-any

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

export interface Bracket<R, E, A> {
    readonly _tag: "bracket";
    readonly acquire: IO<R, E, A>;
    readonly release: FunctionN<[A], IO<R, E, unknown>>;
}

export function bracket<R, E, A>(acquire: IO<R, E, A>, release: FunctionN<[A], IO<R, E, unknown>>): Bracket<R, E, A> {
    return {
        _tag: "bracket",
        acquire,
        release
    };
}

export interface Suspended<R, E, A> {
    readonly _tag: "suspend";
    readonly suspended: IO<R, E, Resource<R, E, A>>;
}

export function suspend<R, E, A>(suspended: IO<R, E, Resource<R, E, A>>): Suspended<R, E, A> {
    return {
        _tag: "suspend",
        suspended
    };
}

export interface Chain<R, E, L, A> {
    readonly _tag: "chain";
    readonly left: Resource<R, E, L>;
    readonly bind: FunctionN<[L], Resource<R, E, A>>;
}

export function chain<R, E, L, A>(left: Resource<R, E, L>, bind: FunctionN<[L], Resource<R, E, A>>): Chain<R, E, L, A> {
    return {
        _tag: "chain",
        left,
        bind
    };
}

export function map<R, E, L, A>(res: Resource<R, E, L>, f: FunctionN<[L], A>): Resource<R, E, A> {
    return chain(res, (r) => pure(f(r)));
}

export function zipWith<R, E, A, B, C>(resa: Resource<R, E, A>,
    resb: Resource<R, E, B>,
    f: FunctionN<[A, B], C>): Resource<R, E, C> {
    return chain(resa, (a) => map(resb, (b) => f(a, b)));
}

export function zip<R, E, A, B>(resa: Resource<R, E, A>, resb: Resource<R, E, B>): Resource<R, E, readonly [A, B]> {
    return zipWith(resa, resb, (a, b) => [a, b] as const);
}

export function ap<R, E, A, B>(resa: Resource<R, E, A>, resfab: Resource<R, E, FunctionN<[A], B>>): Resource<R, E, B> {
    return zipWith(resa, resfab, (a, f) => f(a));
}

export function ap_<R, E, A, B>(resfab: Resource<R, E, FunctionN<[A], B>>, resa: Resource<R, E, A>): Resource<R, E, B> {
    return zipWith(resfab, resa, (f, a) => f(a));
}


export function consume<R, E, A, B>(f: FunctionN<[A], IO<R, E, B>>): FunctionN<[Resource<R, E, A>], IO<R, E, B>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return (r) => use(r, f);
}

export function use<R, E, A, B>(res: Resource<R, E, A>, f: FunctionN<[A], IO<R, E, B>>): IO<R, E, B> {
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


export const URI = "Resource";
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
    interface URItoKind3<R, E, A> {
        Resource: Resource<R, E, A>;
    }
}
export const instances: Monad3<URI> = {
    URI,
    of: pure,
    map,
    ap: ap_,
    chain
} as const;
