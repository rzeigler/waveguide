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

import * as wave from "./wave";
import { WaveR } from "./waver";
import * as waver from "./waver";
import { Managed } from "./managed";
import * as managed from "./managed";
import { constant, FunctionN } from "fp-ts/lib/function";
import { tuple2 } from "./support/util";
import { Monad3 } from "fp-ts/lib/Monad";
import { Monoid } from "fp-ts/lib/Monoid";
import { Semigroup } from "fp-ts/lib/Semigroup";


export type ManagedR<R, E, A> = (r: R) => Managed<E, A>;

export function encaseManaged<E, A>(m: Managed<E, A>): ManagedR<{}, E, A> {
    return constant(m);
}

export function pure<A>(value: A): ManagedR<{}, never, A> {
    return encaseManaged(managed.pure(value));
}

export function encaseWaveR<R, E, A>(wave: WaveR<R, E, A>): ManagedR<R, E, A> {
    return (r) => managed.encaseWave(wave(r));
}

export function bracket<R, E, A>(acquire: WaveR<R, E, A>, release: FunctionN<[A], WaveR<R, E, unknown>>): ManagedR<R, E, A> {
    return (r) => managed.bracket(acquire(r), (a) => release(a)(r));
}

export function suspend<R, E, A>(s: WaveR<R, E, ManagedR<R, E, A>>): ManagedR<R, E, A> {
    return (r) => managed.suspend(waver.map(s, (m) => m(r))(r));
}

export function chain<R, E, L, A>(left: ManagedR<R, E, L>, bind: FunctionN<[L], ManagedR<R, E, A>>): ManagedR<R, E, A> {
    return (r) => managed.chain(left(r), (l) => bind(l)(r));
}

export function chainWith<R, E, L, A>(bind: FunctionN<[L], ManagedR<R, E, A>>): FunctionN<[ManagedR<R, E, L>], ManagedR<R, E, A>> {
    return (left) => chain(left, bind);
}

export function map<R, E, L, A>(res: ManagedR<R, E, L>, f: FunctionN<[L], A>): ManagedR<R, E, A> {
    return (r) => managed.map(res(r), f);
}

export function mapWith<L, A>(f: FunctionN<[L], A>): <R, E>(res: ManagedR<R, E, L>) => ManagedR<R, E, A> {
    return <R, E>(res: ManagedR<R, E, L>) => map(res, f);
}

export function zipWith<R, E, A, B, C>(ma: ManagedR<R, E, A>, mb: ManagedR<R, E, B>, f: FunctionN<[A, B], C>): ManagedR<R, E, C> {
    return chain(ma, (a) => map(mb, (b) => f(a, b)));
}

export function zip<R, E, A, B>(ma: ManagedR<R, E, A>, mb: ManagedR<R, E, B>): ManagedR<R, E, readonly [A, B]> {
    return zipWith(ma, mb, tuple2);
}

/**
 * Apply the function produced by resfab to the value produced by resa to produce a new resource.
 * @param resa 
 * @param resfab 
 */
export function ap<R, E, A, B>(ma: ManagedR<R, E, A>, mfab: ManagedR<R, E, FunctionN<[A], B>>): ManagedR<R, E, B> {
    return zipWith(ma, mfab, (a, f) => f(a));
}

/**
 * Flipped version of ap
 * @param resfab 
 * @param resa 
 */
export function ap_<R, E, A, B>(mfab: ManagedR<R, E, FunctionN<[A], B>>, ma: ManagedR<R, E, A>): ManagedR<R, E, B> {
    return zipWith(mfab, ma, (f, a) => f(a));
}

/**
 * Map a resource to a static value
 * 
 * This creates a resource of the provided constant b where the produced A has the same lifetime internally
 * @param fa 
 * @param b 
 */
export function as<R, E, A, B>(fa: ManagedR<R, E, A>, b: B): ManagedR<R, E, B> {
    return map(fa, constant(b));
}


/**
 * Curried form of as
 * @param b 
 */
export function to<B>(b: B): <R, E, A>(fa: ManagedR<R, E, A>) => ManagedR<R, E, B> {
    return (fa) => as(fa, b);
}

/**
 * Construct a new 'hidden' resource using the produced A with a nested lifetime
 * Useful for performing initialization and cleanup that clients don't need to see
 * @param left 
 * @param bind 
 */
export function chainTap<R, E, A>(left: ManagedR<R, E, A>, bind: FunctionN<[A], ManagedR<R, E, unknown>>): ManagedR<R, E, A> {
    return chain(left, (a) => as(bind(a), a));
}

/**
 * Curried form of chainTap
 * @param bind 
 */
export function chainTapWith<R, E, A>(bind: FunctionN<[A], ManagedR<R, E, unknown>>): FunctionN<[ManagedR<R, E, A>], ManagedR<R, E, A>> {
    return (inner) => chainTap(inner, bind);
}

export function use<R, E, A, B>(ma: ManagedR<R, E, A>, f: FunctionN<[A], WaveR<R, E, B>>): WaveR<R, E, B> {
    return (r) => managed.use(ma(r), (a) => f(a)(r));
}

/**
 * Curried data last form of use
 * @param f 
 */
export function consume<R, E, A, B>(f: FunctionN<[A], WaveR<R, E, B>>): FunctionN<[ManagedR<R, E, A>], WaveR<R, E, B>> {
    return (r) => use(r, f);
}

export function provideTo<R, E, A, B>(ma: ManagedR<R, E, A>, wave: WaveR<A, E, B>): WaveR<R, E, B> {
    return use(ma, (a) => waver.contravaryR(waver.encaseWave(wave(a))));
}

export const URI = "ManagedR";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
    interface URItoKind3<R, E, A> {
        ManagedR: ManagedR<R, E, A>;
    }
}
export const instances: Monad3<URI> = {
    URI,
    of: <R, E, A>(a: A): ManagedR<R, E, A> => pure(a),
    map,
    ap: ap_,
    chain
} as const;

export function getSemigroup<R, E, A>(Semigroup: Semigroup<A>): Semigroup<ManagedR<R, E, A>> {
    return {
        concat(x: ManagedR<R, E, A>, y: ManagedR<R, E, A>): ManagedR<R, E, A> {
            return zipWith(x, y, Semigroup.concat)
        }
    };
}

export function getMonoid<R, E, A>(Monoid: Monoid<A>): Monoid<ManagedR<R, E, A>> {
    return {
        ...getSemigroup(Monoid),
        empty: pure(Monoid.empty)
    }
}
