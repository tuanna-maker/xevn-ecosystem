import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import url from "node:url";

const root = process.cwd();
const dashboardDir = path.join(root, "docs", "program", "dashboard");
const watchFile = path.join(dashboardDir, "dashboard-data.js");
const port = Number(process.env.DASHBOARD_LIVE_PORT || 4177);

const clients = new Set();

function sendEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "application/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  return "text/plain; charset=utf-8";
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || "/", true);
  const pathname = parsed.pathname || "/";

  if (pathname === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write("event: connected\ndata: {\"ok\":true}\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const fullPath = path.join(dashboardDir, cleanPath);
  if (!fullPath.startsWith(dashboardDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(fullPath), "Cache-Control": "no-store" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Dashboard live server running at http://localhost:${port}`);
});

if (fs.existsSync(watchFile)) {
  fs.watch(watchFile, { persistent: true }, () => {
    sendEvent("dashboard-updated", { at: new Date().toISOString() });
  });
}

