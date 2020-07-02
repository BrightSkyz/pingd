import {RequestMethod} from "./RequestMethod";
import {WebModule} from "../index";
import {Request, Response} from "express";

export abstract class Route {

  private path: string;
  private requestMethod: RequestMethod;
  private webModule: WebModule;

  constructor(path: string, requestMethod: RequestMethod, webModule: WebModule) {
    this.path = path;
    this.requestMethod = requestMethod;
    this.webModule = webModule;
  }

  abstract async handleRequest(req: Request, res: Response): Promise<void>;

  getPath(): string {
    return this.path;
  }

  getRequestMethod(): RequestMethod {
    return this.requestMethod;
  }

  getWebModule(): WebModule {
    return this.webModule;
  }
}