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
            if (this.isValidV4(data) || this.isValidV6(data)) {
              if (type == "ping") {
                this.runCommandAndSendOutput(ws, "ping", ["-c", "8", "-i", "0.2", "-t", "255", data]);
              } else if (type == "traceroute") {
                this.runCommandAndSendOutput(ws, "traceroute", ["-q5", "-w", "2", "-m", "30", data]);
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

  runCommandAndSendOutput(ws: websocket, command: string, args: Array<string>): void {
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

  isValidV4(address: string): boolean {
    const address4 = new ipAddress.Address4(address);
    if (!address4.isValid()) return false;
    if (address4.isInSubnet(new ipAddress.Address4("0.0.0.0/8"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("10.0.0.0/8"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("100.64.0.0/10"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("127.0.0.0/8"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("169.254.0.0/16"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("172.16.0.0/12"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("192.0.0.0/24"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("192.0.2.0/24"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("192.168.0.0/16"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("198.18.0.0/15"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("198.51.100.0/24"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("203.0.113.0/24"))) return false;
    if (address4.isInSubnet(new ipAddress.Address4("224.0.0.0/3"))) return false;
    return true;
  }

  isValidV6(address: string): boolean {
    const address6 = new ipAddress.Address6(address);
    if (!address6.isValid()) return false;
    if (address6.isInSubnet(new ipAddress.Address6("::/128"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("::1/128"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("::ffff/96"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("fc00::/7"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("fe80::/10"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("2001:0000::/32"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("2001:0002::/48"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("2001:0010::/28"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("2002::/16"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("2001:db8::/32"))) return false;
    if (address6.isInSubnet(new ipAddress.Address6("ff00::/8"))) return false;
    return true;
  }

}