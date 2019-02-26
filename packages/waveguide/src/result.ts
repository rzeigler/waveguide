import { Cause } from "./cause";

export type Result<E, A> = Completed<A> | Failed<E> | Killed;

export class Completed<A> {
  public readonly _tag: "completed" = "completed";
  constructor(public readonly value: Readonly<A>) { }
}

export class Failed<E> {
  public readonly _tag: "failed" = "failed";
  constructor(public readonly value: Readonly<Cause<E>>) { }
}

export class Killed {
  public readonly _tag: "killed" = "killed";
}
