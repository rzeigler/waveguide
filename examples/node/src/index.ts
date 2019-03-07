// Copyright (c) 2019 Ryan Zeigler
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import "source-map-support/register";

import * as http from "http";
import { IO, terminal, Value } from "../../../src";

export function main(io: IO<never, number>): void {
  const interrupt = io.launch((result) => {
    if (result._tag === "interrupted") {
      process.exit(0);
    } else {
      if (result._tag === "value") {
        process.exit(result.value);
      } else {
        process.exit(-1);
      }
    }
  });
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", interrupt);
  process.on("uncaughtException", (e) => {
    // tslint:disable-next-line
    console.error("uncaught exception: ", e);
    interrupt();
  });
}

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
