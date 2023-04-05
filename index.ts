import express from "express";
import { mountRoutes } from "./src/routes";
import { DelugeClient } from "./src/torrenters/deluge";
import { envMust, envMustInt } from "./src/config";

const clients = {
  deluge: new DelugeClient({
    host: envMust("DELUGE_HOST"),
    port: envMustInt("DELUGE_PORT"),
    password: envMust("DELUGE_PASSWORD"),
  }),
};

const app = express();
mountRoutes(app, clients);

if (process.env.NODE_ENV === "production") app.listen(3000);

export const viteNodeApp = app;
