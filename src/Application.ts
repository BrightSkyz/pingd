import {Module} from "./modules/Module";
import {WebModule} from "./modules/web";
import {WebSocketModule} from "./modules/websocket";

export class Application {

  private webModule: WebModule;
  private webSocketModule: WebSocketModule;

  constructor() {
    this.webModule = new WebModule(this);
    this.webSocketModule = new WebSocketModule(this);
  }

  async start(): Promise<void> {
    await this.startModule(this.webModule);
    await this.startModule(this.webSocketModule);
  }

  async stop(): Promise<void> {
    await this.stopModule(this.webSocketModule);
    await this.stopModule(this.webModule);
    process.exit(1);
  }

  private async startModule(module: Module): Promise<void> {
    console.log("[i] Starting module: " + module.getName());
    await module.start();
  }

  private async stopModule(module: Module): Promise<void> {
    console.log("[i] Stopping module: " + module.getName());
    await module.stop();
  }

  getWebModule(): WebModule {
    return this.webModule;
  }

  getWebSocketModule(): WebSocketModule {
    return this.webSocketModule;
  }
}