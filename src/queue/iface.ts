import { Option } from "fp-ts/lib/Option";
import { IO } from "../io";

export interface AsyncQueue<A> {
  readonly count: IO<never, number>;
  readonly take: IO<never, A>;
  offer(a: A): IO<never, void>;
}

export interface CloseableAsyncQueue<A> {
  readonly close: IO<never, void>;
  readonly isClosed: IO<never, boolean>;
  readonly count: IO<never, number>;
  readonly take: IO<never, Option<A>>;
  offer(a: A): IO<never, boolean>;
}
