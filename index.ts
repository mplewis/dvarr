import express from "express";
import { mountRoutes } from "./src/routes";

const app = express();
mountRoutes(app);

if (process.env.NODE_ENV === "production") app.listen(3000);

export const viteNodeApp = app;
