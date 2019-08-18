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
/* eslint no-console:off */

import { RIO, DefaultR, sync } from "./io";



/**
 * Suspend console.log in an IO
 * @param msg
 */
export function log(msg: string): RIO<DefaultR, never, void> {
    return sync(() => {
    // tslint:disable-next-line
        console.log(msg);
    });
}

/**
 * Suspend console.warn in an IO
 * @param msg
 */
export function warn(msg: string): RIO<DefaultR, never, void> {
    return sync(() => {
    // tslint:disable-next-line
        console.warn(msg);
    });
}

/**
 * Suspend console.error in an IO
 * @param msg
 */
export function error(msg: string): RIO<DefaultR, never, void> {
    return sync(() => {
    // tslint:disable-next-line
        console.error(msg);
    });
}
