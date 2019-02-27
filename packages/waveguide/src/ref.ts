import { IO } from "./io";

export class Ref<A> {
  public static alloc<A>(a: A): IO<never, Ref<A>> {
    return IO.eval(() => Ref.unsafeAlloc<A>(a));
  }

  public static unsafeAlloc<A>(a: A): Ref<A> {
    return new Ref(a);
  }

  public get: IO<never, A> = IO.eval(() => this.a);
  constructor(private a: A) { }
  public set(a: A): IO<never, void> {
    return IO.eval(() => {
      this.a = a;
    });
  }
  public modify(f: (a: A) => A): IO<never, A> {
    return IO.eval(() => {
      this.a = f(this.a);
      return this.a;
    });
  }
}
