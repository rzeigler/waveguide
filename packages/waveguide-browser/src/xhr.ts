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

import { IO, Value } from "waveguide";

const xhrIO: IO<never, XMLHttpRequest> = IO.eval(() => new XMLHttpRequest());

type Method = "GET" | "PUT" | "POST" | "DELETE";

/**
 * Open the XHR and unblock when ready state has reached 4.
 *
 * @param xhr
 * @param verb
 * @param url
 */
function open(xhr: XMLHttpRequest, verb: Method, url: string): IO<never, void> {
  return IO.async((callback) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        callback(new Value(undefined));
      }
    };
    xhr.open(verb, url);
    return () => {
      xhr.abort();
    };
  });
}

function get(url: string): IO<never, XMLHttpRequest> {
  return xhrIO.chain((xhr) => open(xhr, "GET", url).as(xhr));
}
