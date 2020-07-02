import { Application } from "./Application";
import "reflect-metadata";

const application = new Application();

process.on("exit", async () => {
  await application.stop();
});

process.on("SIGINT", async () => {
  await application.stop();
});

setImmediate(async () => await application.start());