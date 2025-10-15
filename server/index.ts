import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser"; // Import body-parser
import { handleDemo } from "./routes/demo";
import { handleSolve } from "./routes/solve";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json()); // Use bodyParser.json()
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Timetable solver
  app.post("/api/solve", handleSolve);

  return app;
}