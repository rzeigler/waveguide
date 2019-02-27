// tslint:disable-next-line
import "source-map-support/register";

import * as http from "http";
import { Fiber, IO, Ref, terminal, Value } from "waveguide";

import {main} from "../index";

class Server {
  public static alloc(): IO<never, Server> {
    return IO.eval(() => new Server(http.createServer()));
  }

  public static shutdown<E>(server: Server): IO<E, void> {
    return IO.eval(() => {
      server.server.close();
    });
  }

  private constructor(private server: http.Server) {}

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

  public close(): IO<never, void> {
    return IO.eval(() => {
      this.server.close(); // this could also be an async if we weren't doing fiber draining by RFM
      return;
    }).critical();
  }
}

class RequestFiberManager {
  public static alloc(): IO<never, RequestFiberManager> {
    return Ref.alloc<Array<Fiber<never, void>>>([])
      .map((cell) => new RequestFiberManager(cell));
  }

  public static drain(rfm: RequestFiberManager): IO<never, void> {
    return rfm.drain();
  }

  private constructor(private readonly cell: Ref<Array<Fiber<never, void>>>) { }

  public track(action: IO<never, void>): IO<never, void> {
    // First we add the fiber to the list
    return action.fork()
      .chain((fiber) => this.addFiber(fiber)
        .applySecond(fiber.wait.fork().chain((complete) => complete.wait.applySecond(this.removeFiber(fiber)))))
      .void();
  }

  // This could be a property instead of method, but shrug
  public drain(): IO<never, void> {
    return this.cell.get.chain((fibers) =>
      fibers.length === 0 ? IO.empty() :
        fibers.map((fiber) =>
                      // Wait up to 5 seconds for a fiber and then kill it
                      fiber.wait.raceOneOf(IO.delay(6000))
                        .chain((r) => r._tag === "first" ?
                          fiber.wait :
                          terminal.log("killing hung fiber").applySecond(fiber.interrupt)))
          .reduce((first, second) => first.applySecond(second))
    );
  }

  private removeFiber(fiber: Fiber<never, void>): IO<never, void> {
    return this.cell.modify((fibers) => fibers.filter((fib) => fib !== fiber)).void();
  }

  private addFiber(fiber: Fiber<never, void>): IO<never, void> {
    return this.cell.modify((fibers) => [fiber, ...fibers]).void();
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

const go: IO<never, number> = RequestFiberManager.alloc()
  .bracket((rfm) => terminal.log("awaiting running fibers").applySecond(rfm.drain()),
           (rfm) =>
    Server.alloc().bracket((server) => terminal.log("closing server").applySecond(server.close()), (server) =>
      server.setHandler((req, res) => rfm.track(handler(req, res)))
        .applySecond(server.listen(4545))
        .applySecond(terminal.log("listening on 4545"))
        .applySecond(IO.never_())
    )
  )
  .ensuring(terminal.log("shutting down"))
  .chainError((e) => IO.of(-1))
  .as(0);

main(go);
