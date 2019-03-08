// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// TODO: Use a proper persistent queue implementation. This gets pretty slow when adding tons of items.
export class Dequeue<A> {
  public static ofAll<A>(as: A[]): Dequeue<A> {
    return new Dequeue(as);
  }

  public static of<A>(a: A): Dequeue<A> {
    return new Dequeue([a]);
  }

  public static empty<A>(): Dequeue<A> {
    return new Dequeue([]);
  }

  public length: number;
  public empty: boolean;

  // TODO: Some day, implement an actual queue
  private constructor(public readonly array: A[]) {
    this.length = array.length;
    this.empty = this.length === 0;
  }

  public enqueue(a: A): Dequeue<A> {
    return new Dequeue([...this.array, a]);
  }

  public enqueueFront(a: A): Dequeue<A> {
    return new Dequeue([a, ...this.array]);
  }

  public dequeue(): [A | undefined, Dequeue<A>] {
    if (this.empty) {
      return [undefined, this];
    }
    return [this.array[0], new Dequeue(this.array.slice(1))];
  }
}
