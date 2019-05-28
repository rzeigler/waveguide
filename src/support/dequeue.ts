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
import { none, Option, option, some } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { cata, cata_, cons, filter_, find_, head, isEmpty, last, List, nil, of as listOf, reverse, size } from "./list";

export interface Dequeue<A> {
  take(): Option<readonly [A, Dequeue<A>]>;
  offer(a: A): Dequeue<A>;
  pull(): Option<readonly [A, Dequeue<A>]>;
  push(a: A): Dequeue<A>;
}

export function from<A>(front: List<A>, back: List<A>): Dequeue<A> {
  function take(): Option<readonly [A, Dequeue<A>]> {
    return cata_(
      front,
      (h, t) => some([h, from(t, back)] as const),
      () => pipe(
        back,
        reverse,
        cata(
          (h, t) => some([h, from(t, nil)] as const),
          () => none
        )
      )
    );
  }

  function offer(a: A): Dequeue<A> {
    return from(front, cons(a, back));
  }

  function pull(): Option<readonly [A, Dequeue<A>]> {
    return cata_(
      back,
      (h, t) => some([h, from(front, t)] as const),
      () => pipe(
        front,
        reverse,
        cata(
          (h, t) => some([h, from(nil, t)] as const),
          () => none
        )
      )
    );
  }

  function push(a: A): Dequeue<A> {
    return from(cons(a, front), back);
  }

  return {
    offer,
    take,
    pull,
    push
  };
}

// export class Dequeue<A> {
//   constructor(public readonly front: List<A>, public readonly back: List<A>) {
//   }

//   /**
//    * Take an item from the front of this queue
//    */
//   public take(): Option<readonly [A, Dequeue<A>]> {
//     return cata_(
//       this.front,
//       (h, t) => some([h, new Dequeue(t, this.back)] as const),
//       () => pipe(
//         this.back,
//         reverse,
//         cata(
//           (h, t) => some([h, new Dequeue(t, nil)] as const),
//           () => none
//         )
//       )
//     );
//   }

//   /**
//    * Enqueue an item to the back of this queue
//    * @param a
//    */
//   public offer(a: A): Dequeue<A> {
//     return new Dequeue(this.front, cons(a, this.back));
//   }

//   /**
//    * Take an item from the back of this queue
//    */
//   public pull(): Option<readonly [A, Dequeue<A>]> {
//     return cata_(
//       this.back,
//       (h, t) => some([h, new Dequeue(this.front, t)] as const),
//       () => pipe(
//         this.front,
//         reverse,
//         cata(
//           (h, t) => some([h, new Dequeue(nil, t)] as const),
//           () => none
//         )
//       )
//     );
//   }

//   /**
//    * Enqueue an item to the front of this queue
//    * @param a
//    */
//   public push(a: A): Dequeue<A> {
//     return new Dequeue(cons(a, this.front), this.back);
//   }

//   /**
//    * Observe the next item that would be removed by take
//    */
//   public peek(): Option<A> {
//     return option.alt(
//       head(this.front),
//       () => last(this.back)
//     );
//   }

//   public isEmpty(): boolean {
//     return isEmpty(this.front) && isEmpty(this.back);
//   }

//   public find(f: Predicate<A>): Option<A> {
//     return option.alt(
//       find_(this.front, f),
//       () => find_(this.back, f)
//     );
//   }

//   public filter(f: Predicate<A>): Dequeue<A> {
//     return new Dequeue(filter_(this.front, f), filter_(this.back, f));
//   }

//   public size(): number {
//     return size(this.front) + size(this.back);
//   }
// }

// export function empty<A>(): Dequeue<A> {
//   return new Dequeue(nil, nil);
// }

// export function of<A>(item: A): Dequeue<A> {
//   return new Dequeue(listOf(item), nil);
// }
