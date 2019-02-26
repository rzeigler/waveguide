import { Cause } from "./cause";

export type Result<E, A> = Completed<A> | Failed<E> | Interrupted;

export class Completed<A> {
  public static create<A>(a: A): Completed<A> {
    return new Completed(a);
  }
  public readonly _tag: "completed" = "completed";
  constructor(public readonly value: Readonly<A>) { }
}

export class Failed<E> {
  public static create<E>(cause: Cause<E>): Failed<E> {
    return new Failed(cause);
  }
  public readonly _tag: "failed" = "failed";
  constructor(public readonly value: Readonly<Cause<E>>) { }
}

export class Interrupted {
  public readonly _tag: "interrupted" = "interrupted";
}

export const interrupted = new Interrupted();
