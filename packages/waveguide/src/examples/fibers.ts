
import { terminal } from "../terminal";

const fiberIO = (n: number) => terminal.log(`waiting 2000 ms -- ${n}`).yield_()
  .applySecond(terminal.log(`waited 2000 ms -- ${n}`).delay(2000));

const io = terminal.log("starting")
  .applySecond(
    fiberIO(1).fork().product(fiberIO(2).fork())
      .chain(([fiber1, fiber2]) =>
      terminal.log("forked")
        .applySecond(terminal.log("wait 100ms").delay(100))
        .applySecond(fiber2.interrupt)
        .applySecond(terminal.log("interrupted fiber2"))
        .applySecond(terminal.log("joining fiber1"))
        .applySecond(fiber1.join)
        .applySecond(terminal.log("fibers complete")))
  );

io.launch();
