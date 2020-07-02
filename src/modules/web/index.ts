import http from "http";
import https from "https";
import express, {Request, Response} from "express";
import cors from "cors";
import naclUtil from "tweetnacl-util";

import {Module} from "../Module";
import {Application} from "../../Application";
import bodyParser from "body-parser";
import {NextFunction} from "express-serve-static-core";
import {WebRoutes} from "./routes/WebRoutes";
import {Route} from "./types/Route";
import {ApiResponseBuilder} from "./types/ApiResponseBuilder";
import {RequestMethod} from "./types/RequestMethod";

const {SERVER_HOST, SERVER_PORT, SERVER_DEBUG_MODE, SERVER_FORCE_SSL, SERVER_SSL, SERVER_SSL_CERT, SERVER_SSL_KEY, SERVER_SSL_CA_CERT, CORS_ORIGINS} = process.env;

export class WebModule extends Module {

  private webServer: http.Server | https.Server;
  private expressApp: express.Application;

  constructor(application: Application) {
    super("web", application);
    this.expressApp = express();
    this.expressApp.disable("x-powered-by");
    this.expressApp.use("/upload", bodyParser.raw({limit: "1mb", type: "*/*"}));
    this.expressApp.use(bodyParser.urlencoded({limit: "1mb", extended: true}));
    this.expressApp.use(bodyParser.json({limit: "1mb", type: "application/json"}));
    // CORS Protection
    const corsWhitelist = String(CORS_ORIGINS).split(",");
    this.expressApp.use(function (req: Request, res: Response, next: NextFunction) {
      if (String(SERVER_FORCE_SSL) == "true") {
        if (req.get("x-forwarded-proto") && req.get("x-forwarded-proto") !== "https") {
          return res.redirect(302, "https://" + req.get("host") + req.url);
        }
      }
      next();
    });
    this.expressApp.use(cors({
      origin: function(origin: string | undefined, callback) {
        if (!origin) {
          return callback(null, true);
        }
        if (corsWhitelist.indexOf(origin) === -1){
          return callback(null, false);
        }
        return callback(null, true);
      }
    }));
    if (SERVER_SSL === "true") {
      this.webServer = https.createServer({
        key: naclUtil.encodeUTF8(naclUtil.decodeBase64(String(SERVER_SSL_KEY))),
        cert: naclUtil.encodeUTF8(naclUtil.decodeBase64(String(SERVER_SSL_CERT))),
        ca: naclUtil.encodeUTF8(naclUtil.decodeBase64(String(SERVER_SSL_CA_CERT))),
        requestCert: false,
        rejectUnauthorized: false
      }, this.expressApp);
    } else {
      this.webServer = http.createServer(this.expressApp);
    }
  }

  async start(): Promise<void> {
    const webRoutesArray = WebRoutes.getRoutes(this);
    webRoutesArray.forEach((route: Route) => {
      this.registerRoute(route);
    });
    this.expressApp.use("*", (req: Request, res: Response) => {
      const apiResponseBuilder = ApiResponseBuilder.createError(404, "Not found.", res);
      apiResponseBuilder.send();
    });
    this.webServer.listen(Number(SERVER_PORT), String(SERVER_HOST), () => {
      console.log("[i] Web server is listening on port: " + SERVER_PORT);
    });
  }

  async stop(): Promise<void> {
    //
  }

  async registerRoute(route: Route): Promise<void> {
    const routePath = String(route.getPath());
    const routeRequestMethod = route.getRequestMethod();
    const routeRequestMethodCode = routeRequestMethod.getCode();
    if (routeRequestMethodCode == RequestMethod.DELETE.getCode()) {
      this.expressApp.delete(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    } else if (routeRequestMethodCode == RequestMethod.GET.getCode()) {
      this.expressApp.get(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    } else if (routeRequestMethodCode == RequestMethod.HEAD.getCode()) {
      this.expressApp.head(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    } else if (routeRequestMethodCode == RequestMethod.PATCH.getCode()) {
      this.expressApp.patch(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    } else if (routeRequestMethodCode == RequestMethod.POST.getCode()) {
      this.expressApp.post(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    } else if (routeRequestMethodCode == RequestMethod.PUT.getCode()) {
      this.expressApp.put(routePath, async (req: Request, res: Response) => {
        await this.handleRoute(route, req, res);
      });
    }
    console.log("[i] Registered route: " + routeRequestMethod + " " + routePath);
  }

  private async handleRoute(route: Route, req: Request, res: Response): Promise<void> {
    try {
      return route.handleRequest(req, res);
    } catch (e) {
      console.log(e);
      if (String(SERVER_DEBUG_MODE) == "true") {
        res.setHeader("Content-Type", "text/plain");
        res.status(500).send(e);
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.status(500).send("An internal server error occurred.");
      }
    }
  }

  getWebServer(): http.Server | https.Server {
    return this.webServer;
  }

}