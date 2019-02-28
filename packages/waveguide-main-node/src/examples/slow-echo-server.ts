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
