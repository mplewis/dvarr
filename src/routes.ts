import { Express } from "express";

export function mountRoutes(app: Express) {
  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });
}
