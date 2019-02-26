import { IO, sync } from "./io";

export interface Ref<A> {
  get: IO<never, A>;
  set(a: A): IO<never, void>;
  modify(f: (a: A) => A): IO<never, A>;
}

class RefImpl<A> implements Ref<A> {
  public get: IO<never, A> = sync(() => this.a);
  constructor(private a: A) { }
  public set(a: A): IO<never, void> {
    return sync(() => {
      this.a = a;
    });
  }
  public modify(f: (a: A) => A): IO<never, A> {
    return sync(() => {
      this.a = f(this.a);
      return this.a;
    });
  }
}

export function unsafeRef<A>(a: A): Ref<A> {
  return new RefImpl(a);
}

export function ref<A>(a: A): IO<never, Ref<A>> {
  return sync(() => unsafeRef(a));
}
