import { NextApiHandler } from "next";
import { nextHandler } from "trpc-playground/handlers/next";
import { appRouter } from "../../server/router";

const setupHandler = nextHandler({
  router: appRouter,
  trpcApiEndpoint: "/api/trpc",
  playgroundEndpoint: "/api/trpc-playground",
  polling: {
    interval: 4000,
  },
  request: {
    superjson: true,
  },
});

const handler: NextApiHandler = async (req, res) => {
  if (process.env.NODE_ENV === "development") {
    const playgroundHandler = await setupHandler;
    await playgroundHandler(req, res);
    return;
  }

  res.status(404).json({ error: "Not found" });
};

export default handler;
