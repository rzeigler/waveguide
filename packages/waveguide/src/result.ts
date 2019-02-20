/**
 * Encode the results of IO actions
 */

import { none, Option, some } from "fp-ts/lib/Option";

export type Result<E, A> = Success<A> | Failure<E>;

export class Success<A> {
  public static of<A>(a: A): Success<A> {
    return new Success(a);
  }
  public readonly variant: "success" = "success";
  constructor(public readonly value: A) { }
}

export class Failure<E> {
  public static ofRaise<E>(e: E) {
    return new Failure(new Raise(e));
  }
  public readonly variant: "failure" = "failure";
  constructor(public readonly reason: Reason<E>) { }
}

export type Reason<E> = Raise<E> | Abort;

export class Raise<E> {
  public readonly variant: "raise" = "raise";
  constructor(public readonly raise: E, public readonly also: Option<Reason<E>> = none) { }
  public and(also: Reason<E>): Raise<E> {
    return new Raise(this.raise, this.also.map((a) => a.and(also)).orElse(() => some(also)));
  }
}

export class Abort {
  public readonly variant: "abort" = "abort";
  public constructor(public readonly abort: unknown, public readonly also: Option<Reason<unknown>> = none) { }
  public and(also: Reason<unknown>): Abort {
    return new Abort(this.abort, this.also.map((a) => a.and(also)).orElse(() => some(also)));
  }
}

export type ResultListener<E, A> = (result: Result<E, A>) => void;
