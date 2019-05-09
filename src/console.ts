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

import { effect, IO } from "./io";

function log(msg: string): IO<never, void> {
  return effect(() => {
    // tslint:disable-next-line
    console.log(msg);
  });
}

function warn(msg: string): IO<never, void> {
  return effect(() => {
    // tslint:disable-next-line
    console.warn(msg);
  });
}

function error(msg: string): IO<never, void> {
  return effect(() => {
    // tslint:disable-next-line
    console.error(msg);
  });
}

const console = {
  log,
  warn,
  error
} as const;
