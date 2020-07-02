import {Application} from "../Application";

export abstract class Module {

  private readonly name: string;
  private readonly application: Application;

  constructor(name: string, application: Application) {
    this.name = name;
    this.application = application;
  }

  abstract async start(): Promise<void>;

  abstract async stop(): Promise<void>;

  getName(): string {
    return this.name;
  }

  getApplication(): Application {
    return this.application;
  }

}