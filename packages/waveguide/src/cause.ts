export type Cause<E> = Raise<E> | Abort;

export class Raise<E> {
  public readonly _tag: "raise" = "raise";
  constructor(public readonly error: E, public readonly more: ReadonlyArray<Cause<E>> = []) { }
  public and(cause: Cause<E>): Cause<E> {
    return new Raise(this.error, [...this.more, cause]);
  }
}

export class Abort {
  public readonly _tag: "abort" = "abort";
  constructor(public readonly error: unknown, public readonly more: ReadonlyArray<Cause<unknown>> = []) { }
  public and(cause: Cause<unknown>): Cause<unknown> {
    return new Abort(this.error, [...this.more, cause]);
  }
}
