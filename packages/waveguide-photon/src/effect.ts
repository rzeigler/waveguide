export interface Effect<E, A> {
  map<B>(f: (a: A) => B): Effect<E, B>
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B>
  chain<B>(f: (a: A) => Effect<E, B>): Effect<E, B>
}

export type AsyncCallback<E, A> = (reject: (e: E) => void, resolve: (a: A) => void) => void;

export function of<A>(a: A): Effect<never, A> {
  return new Pure(a);
}

export function delay<A>(lazy: () => A): Effect<never, A> {
  return new Delay(() => of(lazy()));
}

export function effect<E, A>(lazy: () => Effect<E, A>): Effect<E, A> {
  return new Delay(lazy);
}

export function async<E, A>(call: AsyncCallback<E, A>): Effect<E, A> {
  return new Async(call);
}

export function fail<E>(e: E): Effect<E, never> {
  return new Fail(e);
}

function chainMap<E, A, B>(f: (a: A) => B): (a: A) => Effect<E, B> {
  return (a: A) => new Pure(f(a));
}

function chainAp<E, A, B>(fab: Effect<E, (a: A) => B>): (a: A) => Effect<E, B> {
  return (a: A) => fab.map(f => f(a));
}

class Pure<E, A> implements Effect<E, A> {
  readonly a: A;
  constructor(a: A) {
    this.a = a;
  }
  map<B>(f: (a: A) => B): Effect<E, B> {
    return this.chain(chainMap(f));
  }
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B> {
    return this.chain(chainAp(fab));
  }
  chain<B>(f: (a: A) => Effect<E, B>): Effect<E, B> {
    return new Chain(this, f);
  }
}

class Fail<E, A> implements Effect<E, A> {
  readonly e: E;
  constructor(e: E) {
    this.e = e;
  }
  map<B>(f: (a: A) => B): Effect<E, B> {
    return this.chain(chainMap(f));
  }
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B> {
    return this.chain(chainAp(fab));
  }
  chain<B>(f: (a: A) => Effect<E, B>): Effect<E, B> {
    return new Chain(this, f);
  }
}

class Delay<E, A> implements Effect<E, A> {
  readonly lazy: () => Effect<E, A>;
  constructor(lazy: () => Effect<E, A>) {
    this.lazy = lazy;
  }
  map<B>(f: (a: A) => B): Effect<E, B> {
    return this.chain(chainMap(f));
  }
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B> {
    return this.chain(chainAp(fab));
  }
  chain<B>(f: (a: A) => Effect<E, B>): Effect<E, B> {
    return new Chain(this, f);
  }
}

class Async<E, A> implements Effect<E, A> {
  readonly callback: AsyncCallback<E, A>;
  constructor(callback: AsyncCallback<E, A>) {
    this.callback = callback;
  }
  map<B>(f: (a: A) => B): Effect<E, B> {
    return this.chain(chainMap(f));
  }
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B> {
    return this.chain(chainAp(fab));
  }
  chain<B>(f: (a: A) => Effect<E, B>): Effect<E, B> {
    return new Chain(this, f);
  }
}

class Chain<E, A0, A> implements Effect<E, A> {
  readonly base: Effect<E, A0>;
  readonly f: (a: A0) => Effect<E, A>;
  constructor(base: Effect<E, A0>, f: (a: A0) => Effect<E, A>) {
    this.base = base;
    this.f = f;
  }
  map<B>(f: (a: A) => B): Effect<E, B> {
    return this.chain(chainMap(f));
  }
  ap<B>(fab: Effect<E, (a: A) => B>): Effect<E, B> {
    return this.chain(chainAp(fab));
  }
  chain<B>(f: (b: A) => Effect<E, B>): Effect<E, B> {
    return new Chain(this.base, (a: A0) => new Chain(this.f(a), f));
  }
}
