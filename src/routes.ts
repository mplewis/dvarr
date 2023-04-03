import { PrismaClient } from "@prisma/client";
import { Express, Response } from "express";

const prisma = new PrismaClient();

async function catchall(res: Response, callable: () => Promise<void>) {
  try {
    await callable();
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export function mountRoutes(app: Express) {
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
}
