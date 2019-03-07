// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
