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

import { array } from "fp-ts/lib/Array";
import { Function2, Lazy, Predicate } from "fp-ts/lib/function";
import { none, Option, some } from "fp-ts/lib/Option";

export type List<A> = Cons<A> | Nil<A>;

export class Cons<A> {
  public readonly _tag: "cons" = "cons";
  constructor(public readonly a: A, public readonly rest: List<A>) { }

  public prepend(a: A): List<A> {
    return new Cons(a, this);
  }

  public cata<B>(ifNil: B, ifCons: Function2<A, List<A>, B>): B {
    return ifCons(this.a, this.rest);
  }

  public cataL<B>(ifNil: Lazy<B>, ifCons: Function2<A, List<A>, B>): B {
    return ifCons(this.a, this.rest);
  }

  public head(): Option<A> {
    return some(this.a);
  }

  public tail(): Option<List<A>> {
    return some(this.rest);
  }

  public foldl<B>(b: B, f: Function2<B, A, B>): B {
    let current: List<A> = this;
    while (current._tag === "cons") {
      b = f(b, current.a);
      current = current.rest;
    }
    return b;
  }

  public reverse(): List<A> {
    return this.foldl<List<A>>(nil, (tail, head) => tail.prepend(head));
  }

  public drop(n: number): List<A> {
    let current: List<A> = this;
    while (n > 0 && current._tag === "cons") {
      current = this.rest;
    }
    return current;
  }

  public init(): Option<List<A>> {
    return some(this.reverse()
      .drop(1)
      .reverse());
  }

  public last(): Option<A> {
    let head: A = this.a;
    let tail: List<A> = this.rest;
    while (tail._tag !== "nil") {
      head = tail.a;
      tail = tail.rest;
    }
    return some(head);
  }

  public filter(f: Predicate<A>): List<A> {
    return this.foldl<List<A>>(nil, (tail, head) => f(head) ? tail.prepend(head) : tail);
  }

  public find(f: Predicate<A>): Option<A> {
    let current: List<A> = this;
    while (current._tag === "cons") {
      if (f(current.a)) {
        return some(current.a);
      }
      current = current.rest;
    }
    return none;
  }

  public isEmpty(): this is Nil<A> {
    return false;
  }

  public size(): number {
    let current: List<A> = this;
    let size = 0;
    while (current._tag !== "nil") {
      size++;
      current = current.rest;
    }
    return size;
  }
}

export class Nil<A> {
  public readonly _tag: "nil" = "nil";

  public prepend(a: A): List<A> {
    return new Cons(a, this);
  }

  public cata<B>(ifNil: B, ifCons: Function2<A, List<A>, B>): B {
    return ifNil;
  }

  public cataL<B>(ifNil: Lazy<B>, ifCons: Function2<A, List<A>, B>): B {
    return ifNil();
  }

  public head(): Option<A> {
    return none;
  }

  public tail(): Option<List<A>> {
    return none;
  }

  public foldl<B>(b: B, f: Function2<B, A, B>): B {
    return b;
  }

  public reverse(): List<A> {
    return this;
  }

  public filter(): List<A> {
    return this;
  }

  public drop(n: number): List<A> {
    return this;
  }

  public init(): Option<List<A>> {
    return none;
  }

  public last(): Option<A> {
    return none;
  }

  public isEmpty(): this is Nil<A> {
    return true;
  }

  public find(f: Predicate<A>): Option<A> {
    return none;
  }

  public size(): number {
    return 0;
  }
}

const nil: Nil<never> = new Nil();

function prepend<A>(a: A, rest: List<A>): List<A> {
  return rest.prepend(a);
}

function fromArray<A>(as: A[]): List<A> {
  return array.foldr(as, nil as List<A>, prepend);
}

export const list = {
  nil,
  prepend,
  fromArray
};
