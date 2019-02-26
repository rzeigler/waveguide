import { Either } from "fp-ts/lib/Either";

import { Cause, Raise } from "./cause";
import { IO } from "./io";

export type IOStep<E, A> =
  Of<A>
  | Failed<E>
  | Caused<E>
  | Suspend<E, A>
  | Async<E, A>
  | Critical<E, A>
  | Chain<E, any, A>
  | ChainError<E, any, A>
  | Finally<E, any, A>
  | Bracket<E, any, A>;

export class Of<A> {
  public readonly _tag: "of" = "of";
  constructor(public readonly value: A) { }
}

export class Failed<E> {
  public readonly _tag: "failed" = "failed";
  constructor(public readonly error: E) { }
}

export class Caused<E> {
  public readonly _tag: "raised" = "raised";
  constructor(public readonly raise: Cause<E>) { }
}

export class Suspend<E, A> {
  public readonly _tag: "suspend" = "suspend";
  constructor(public readonly thunk: () => IO<E, A>) { }
}

export class Async<E, A> {
  public readonly _tag: "async" = "async";
  constructor(public readonly start: (resume: (result: Either<Cause<E>, A>) => void) => (() => void)) { }
}

export class Critical<E, A> {
  public readonly _tag: "critical" = "critical";
  constructor(public readonly io: IO<E, A>) { }
}

export class ChainError<E, LeftError, A> {
  public readonly _tag: "chainerror" = "chainerror";
  constructor(public readonly left: IO<LeftError, A>, public readonly chain: (error: Cause<LeftError>) => IO<E, A>) { }
}

export class Chain<E, Left, A> {
  public readonly _tag: "chain" = "chain";
  constructor(public readonly left: IO<E, Left>, public readonly chain: (left: Left) => IO<E, A>) { }
}

export class Finally<E, B, A> {
  public readonly _tag: "finally" = "finally";
  constructor(public readonly first: IO<E, A>, public readonly always: IO<E, B>) { }
}

export class Bracket<E, R, A> {
  public readonly _tag: "bracket" = "bracket";
  constructor(public readonly resource: IO<E, R>,
              public readonly release: (r: R) => IO<E, void>,
              public readonly consume: (r: R) => IO<E, A>) { }
}
