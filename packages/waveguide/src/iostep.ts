// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2019 Ryan Zeigler
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { IO } from "./io";
import { Cause, Result } from "./result";

export type IOStep<E, A> =
  Of<A>
  | Failed<E>
  | Caused<E>
  | Suspend<E, A>
  | Async<E, A>
  | Critical<E, A>
  | Chain<E, any, A>
  | ChainError<E, any, A>
  | OnDone<E, any, A>
  | OnInterrupted<E, any, A>;

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
  constructor(public readonly start: (resume: (result: Result<E, A>) => void) => (() => void)) { }
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

export class OnDone<E, B, A> {
  public readonly _tag: "ondone" = "ondone";
  constructor(public readonly first: IO<E, A>, public readonly always: IO<never, B>) { }
}

export class OnInterrupted<E, B, A> {
  public readonly _tag: "oninterrupted" = "oninterrupted";
  constructor(public readonly first: IO<E, A>, public readonly interupted: IO<never, B>) { }
}
