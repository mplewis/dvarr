import { PrismaClient } from "@prisma/client";
import { Express, Response } from "express";
import { z } from "zod";
import { querySchema, searchBTN } from "./trackers/btn";
import { Clients } from "./config";

const prisma = new PrismaClient();

async function catchall(res: Response, callable: () => Promise<void>) {
  try {
    await callable();
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export function mountRoutes(app: Express, clients: Clients) {
  app.get("/", async (_req, res) => {
    catchall(res, async () => {
      const user = await prisma.user.create({
        data: {
          name: "Alice",
          email: `alice-${new Date().getTime()}@prisma.io`,
        },
      });
      console.log(user);

      const count = await prisma.user.count();
      res.send(`User count: ${count}`);
    });
  });

  app.get("/search", async (req, res) => {
    catchall(res, async () => {
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json(parsed.error);
        return;
      }
      const query = parsed.data;
      const results = await searchBTN(query);
      res.json(results);
    });
  });

  app.get("/add_torrent", async (req, res) => {
    catchall(res, async () => {
      const schema = z.object({ url: z.string() });
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json(parsed.error);
        return;
      }
      const { url } = parsed.data;
      const results = await clients.deluge.addTorrentFromURL(url);
      res.json(results);
    });
  });
}
