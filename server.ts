import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "app.log");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/logs", (req, res) => {
    const { level, message, timestamp, context } = req.body;
    const logEntry = `[${timestamp}] [${level}] ${message} ${context ? JSON.stringify(context) : ''}\n`;
    
    fs.appendFile(LOG_FILE, logEntry, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
        return res.status(500).json({ error: "Failed to write log" });
      }
      res.json({ status: "logged" });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    
    // SPA fallback
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
