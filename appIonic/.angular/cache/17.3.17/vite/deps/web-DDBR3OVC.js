import {
  WebPlugin
} from "./chunk-PZHYISND.js";
import {
  __async
} from "./chunk-EAE2VPRF.js";

// node_modules/@capacitor/network/dist/esm/web.js
function translatedConnection() {
  const connection = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
  let result = "unknown";
  const type = connection ? connection.type || connection.effectiveType : null;
  if (type && typeof type === "string") {
    switch (type) {
      case "bluetooth":
      case "cellular":
        result = "cellular";
        break;
      case "none":
        result = "none";
        break;
      case "ethernet":
      case "wifi":
      case "wimax":
        result = "wifi";
        break;
      case "other":
      case "unknown":
        result = "unknown";
        break;
      case "slow-2g":
      case "2g":
      case "3g":
        result = "cellular";
        break;
      case "4g":
        result = "wifi";
        break;
      default:
        break;
    }
  }
  return result;
}
var NetworkWeb = class extends WebPlugin {
  constructor() {
    super();
    this.handleOnline = () => {
      const connectionType = translatedConnection();
      const status = {
        connected: true,
        connectionType
      };
      this.notifyListeners("networkStatusChange", status);
    };
    this.handleOffline = () => {
      const status = {
        connected: false,
        connectionType: "none"
      };
      this.notifyListeners("networkStatusChange", status);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }
  getStatus() {
    return __async(this, null, function* () {
      if (!window.navigator) {
        throw this.unavailable("Browser does not support the Network Information API");
      }
      const connected = window.navigator.onLine;
      const connectionType = translatedConnection();
      const status = {
        connected,
        connectionType: connected ? connectionType : "none"
      };
      return status;
    });
  }
};
var Network = new NetworkWeb();
export {
  Network,
  NetworkWeb
};
//# sourceMappingURL=web-DDBR3OVC.js.map
