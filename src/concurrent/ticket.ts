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

import { boundMethod } from "autobind-decorator";
import { Exit } from "../core/exit";
import { IO, io } from "../core/io";

export class Ticket<A> {
  constructor(public readonly acquire: IO<never, A>, public readonly cleanup: IO<never, void>) { }
}

export function ticketExit(ticket: Ticket<unknown>, exit: Exit<never, unknown>): IO<never, void> {
  if (exit._tag === "interrupted") {
    return ticket.cleanup;
  }
  return io.unit;
}

export function ticketUse<A>(ticket: Ticket<A>): IO<never, A> {
  return ticket.acquire;
}
