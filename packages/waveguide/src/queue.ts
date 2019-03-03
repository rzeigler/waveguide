export class Dequeue<A> {
  public static ofAll<A>(as: ReadonlyArray<A>): Dequeue<A> {
    return new Dequeue(as);
  }

  public static empty<A>(): Dequeue<A> {
    return new Dequeue([]);
  }

  public length: number;
  public empty: boolean;

  // TODO: Some day, implement an actual queue
  private constructor(public readonly array: ReadonlyArray<A>) {
    this.length = array.length;
    this.empty = this.length === 0;
  }

  public offer(a: A): Dequeue<A> {
    return new Dequeue([...this.array, a]);
  }

  public push(a: A): Dequeue<A> {
    return new Dequeue([a, ...this.array]);
  }

  public take(): [A | undefined, Dequeue<A>] {
    if (this.empty) {
      return [undefined, this];
    }
    return [this.array[0], new Dequeue(this.array.slice(1))];
  }
}
