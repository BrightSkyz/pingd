import {Module} from "../Module";
import {Application} from "../../Application";
import * as websocket from "ws";
import {spawn} from "child_process";
import ipAddress from "ip-address";

export class WebSocketModule extends Module {

  private webSocketServer: websocket.Server;

  constructor(application: Application) {
    super("websocket", application);
    this.webSocketServer = new websocket.Server({
      server: this.getApplication().getWebModule().getWebServer()
    });
  }

  async start(): Promise<void> {
    this.webSocketServer.on("connection", (ws: websocket) => {
      ws.on("message", (message: string) => {
        try {
          const jsonMessage = JSON.parse(message);
          if (jsonMessage && typeof jsonMessage === "object") {
            if (!jsonMessage.type || !jsonMessage.data) {
              ws.send(JSON.stringify({
                type: "error",
                data: "Invalid data."
              }));
              return;
            }
            // Process request
            const type = String(jsonMessage.type);
            const data = String(jsonMessage.data);
            const isValidAddress4 = new ipAddress.Address4(data).isValid();
            const isValidAddress6 = new ipAddress.Address6(data).isValid();
            if (isValidAddress4 || isValidAddress6) {
              if (type == "ping") {
                this.runCommandAndSendOutput(ws, "ping", ["-c", "8", "-i", "0.2", "-t", "255", data]);
              } else if (type == "traceroute") {
                this.runCommandAndSendOutput(ws, "traceroute", ["-A", "-q5", "-w", "2", "-m", "30", data]);
              } else if (type == "mtr") {
                this.runCommandAndSendOutput(ws, "mtr", ["-zboLDRSNBAWVGJMXI", "-rwc10", "-i", "0.2", "-m", "50", data]);
              } else {
                ws.send(JSON.stringify({
                  type: "error",
                  data: "Invalid type specified."
                }));
              }
            } else {
              ws.send(JSON.stringify({
                type: "error",
                data: "Invalid address specified."
              }));
            }
          } else {
            ws.send(JSON.stringify({
              type: "error",
              data: "Invalid data."
            }));
            return;
          }
        } catch (e) {
          ws.send(JSON.stringify({
            type: "error",
            data: "Invalid data."
          }));
          return;
        }
      });
      ws.on("close", () => {
        ws.terminate();
      });
      ws.send(JSON.stringify({
        type: "connected",
        data: ""
      }));
    });
  }

  async stop(): Promise<void> {
    return;
  }

  getWebSocketServer(): websocket.Server {
    return this.webSocketServer;
  }

  runCommandAndSendOutput(ws: websocket, command: string, args: Array<string>) {
    ws.send(JSON.stringify({
      type: "status",
      data: "start"
    }));
    const pingProcess = spawn(command, args);
    pingProcess.stdout.setEncoding("utf-8");
    pingProcess.stdout.on("data", function (processData: string) {
      if (ws.readyState == ws.CLOSING || ws.readyState == ws.CLOSED) {
        return;
      }
      ws.send(JSON.stringify({
        type: "response",
        data: processData
      }));
    });
    pingProcess.stderr.setEncoding("utf-8");
    pingProcess.stderr.on("data", function (processData: string) {
      if (ws.readyState == ws.CLOSING || ws.readyState == ws.CLOSED) {
        return;
      }
      ws.send(JSON.stringify({
        type: "response",
        data: processData
      }));
    });
    pingProcess.once("exit", function () {
      ws.send(JSON.stringify({
        type: "status",
        data: "end"
      }));
    });
  }

}