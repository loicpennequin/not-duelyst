import { app, BrowserWindow, session } from "electron";
import path from "path";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.ROOT = path.join(__dirname, "..");
process.env.DIST = path.join(process.env.ROOT, "dist-electron");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, "public")
  : path.join(process.env.ROOT, ".output/public");
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow;
const preload = path.join(process.env.DIST, "preload.js");

function bootstrap() {
  win = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  win.maximize();
  win.show();
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL + "/play");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.VITE_PUBLIC!, "index.html"));
  }
}

app.whenReady().then(() => {
  //proper-lacewing-34.clerk.accounts.dev

  https: session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ["https://proper-lacewing-34.clerk.accounts.dev/*"] },
    (details, callback) => {
      details.requestHeaders["Origin"] = "http://localhost:3002";
      callback({ requestHeaders: details.requestHeaders });
    }
  );
  bootstrap();
});
