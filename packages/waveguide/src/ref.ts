import { IO } from "./io";

export class Ref<A> {
  public static of<A>(a: A): IO<never, Ref<A>> {
    return IO.sync(() => Ref.ofUnsafe(a));
  }
  public static ofUnsafe<A>(a: A): Ref<A> {
    return new Ref(a);
  }

  public readonly get: IO<never, A>;

  private constructor(private a: A) {
    this.get = IO.sync(() => this.a);
  }

  public set(a: A): IO<never, void> {
    return IO.sync(() => {
      this.a = a;
    });
  }

  public modify(f: (a: A) => A): IO<never, A> {
    return this.get.map(f)
      .chain((b) => this.set(b).applySecond(this.get));
  }
}
