import { List, list } from "./list";

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

import { Predicate } from "fp-ts/lib/function";
import { none, Option, some } from "fp-ts/lib/Option";
import * as o from "fp-ts/lib/Option";

export class Dequeue<A> {
  constructor(public readonly front: List<A>, public readonly back: List<A>) {
  }

  /**
   * Take an item from the front of this queue
   */
  public take(): Option<readonly [A, Dequeue<A>]> {
    return this.front.cataL(
      () => this.back.reverse()
        .cata(none, (head, rest) => some([head, new Dequeue(rest, list.nil)] as const)),
      (head, rest) => some([head, new Dequeue(rest, this.back)] as const)
    );
  }

  /**
   * Enqueue an item to the back of this queue
   * @param a
   */
  public offer(a: A): Dequeue<A> {
    return new Dequeue(this.front, this.back.prepend(a));
  }

  /**
   * Take an item from the back of this queue
   */
  public pull(): Option<readonly [A, Dequeue<A>]> {
    return this.back.cataL(
      () => this.front.reverse()
        .cata(none, (head, rest) => some([head, new Dequeue(list.nil, rest)] as const)),
      (head, rest) => some([head, new Dequeue(this.front, rest)] as const)
    );
  }

  /**
   * Enqueue an item to the front of this queue
   * @param a
   */
  public push(a: A): Dequeue<A> {
    return new Dequeue(this.front.prepend(a), this.back);
  }

  /**
   * Observe the next item that would be removed by take
   */
  public peek(): Option<A> {
    return o.getFirstMonoid<A>().concat(
      this.front.head(),
      this.back.last()
    );
  }

  public isEmpty(): boolean {
    return this.front.isEmpty() && this.back.isEmpty();
  }

  public size(): number {
    return this.front.size() + this.back.size();
  }

  public find(f: Predicate<A>): Option<A> {
    return o.getFirstMonoid<A>().concat(
      this.front.find(f),
      this.back.find(f)
    );
  }

  public filter(f: Predicate<A>): Dequeue<A> {
    return new Dequeue(this.front.filter(f), this.back.filter(f));
  }
}

export function empty<A>(): Dequeue<A> {
  return new Dequeue(list.nil, list.nil);
}

export function of<A>(item: A): Dequeue<A> {
  return empty<A>().offer(item);
}
