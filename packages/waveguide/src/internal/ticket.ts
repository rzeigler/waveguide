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

import { IO } from "../io";
import { FiberResult } from "../result";

/**
 * Provides encapsulation mechanism for blocking waits that should perform cleanup when interrupted
 */
export class Ticket<A> {
  public static cleanup<A>(ticket: Ticket<A>, result: FiberResult<never, A>) {
    if (result._tag === "interrupted") {
      return ticket.cleanup;
    }
    return IO.void();
  }
  constructor(public readonly wait: IO<never, A>, public readonly cleanup: IO<never, void>) { }
}
