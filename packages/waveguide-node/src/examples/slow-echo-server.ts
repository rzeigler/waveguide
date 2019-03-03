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

// tslint:disable-next-line
import "source-map-support/register";

import * as http from "http";
import { Fiber, IO, Ref, terminal, Value } from "waveguide";

import {main} from "../index";

class Server {
  public static alloc(): IO<never, Server> {
    return IO.eval(() => new Server(http.createServer()));
  }

  private constructor(private server: http.Server) {}

  public drain(): IO<never, void> {
    return IO.async<never, void>((callback) => {
      this.server.close(() => {
        callback(new Value(undefined));
      });
      return () => { return; };
    }).critical();
  }

  public setHandler(handle: (req: http.IncomingMessage, res: http.ServerResponse) => IO<never, void>): IO<never, void> {
    return IO.eval(() => {
      this.server.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
        handle(req, res).launch();
      });
    });
  }

  public listen(port: number): IO<never, void> {
    return IO.eval(() => {
      this.server.listen(port);
    });
  }
}

function handler(req: http.IncomingMessage, res: http.ServerResponse): IO<never, void> {
  return IO.suspend<never, void>(() => {
    res.setHeader("content-type", "text/plain");
    res.write(req.url);
    return IO.async<never, void>((callback) => {
      res.end(() => callback(new Value(undefined)));
      return () => { return; };
    }).critical();
  }).delay(5000);
}

const go: IO<never, number> =
  Server.alloc().bracket((server) => terminal.log("shutting down").applySecond(server.drain()), (server) =>
    server.setHandler(handler)
      .applySecond(server.listen(4545))
      .applySecond(terminal.log("listening on 4545"))
      .applySecond(IO.never_())
  )
  .ensuring(terminal.log("shut down"))
  .as(0);

main(go);
