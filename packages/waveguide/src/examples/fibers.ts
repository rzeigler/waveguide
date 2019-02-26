
import ConsoleIO from "../console";

const fiberIO = (n: number) => ConsoleIO.log(`waiting 2000 ms -- ${n}`).shift()
  .applySecond(ConsoleIO.log(`waited 2000 ms -- ${n}`).delay(2000));

const io = ConsoleIO.log("starting")
  .applySecond(
    fiberIO(1).fork().product(fiberIO(2).fork())
      .chain(([fiber1, fiber2]) =>
        ConsoleIO.log("forked")
        .applySecond(ConsoleIO.log("wait 100ms").delay(100))
        .applySecond(fiber2.interrupt)
        .applySecond(ConsoleIO.log("interrupted fiber2"))
        .applySecond(ConsoleIO.log("joining fiber1"))
        .applySecond(fiber1.join)
        .applySecond(ConsoleIO.log("fibers complete")))
  );

io.launch();
