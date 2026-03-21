import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { Hono } from "hono";
import { router } from "./router.ts";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

const rpcHandler = new RPCHandler(router, {
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin,
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    }),
  ],
});

app.all("/rpc/*", async (c) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { DB: c.env.DB },
  });
  if (matched) return response;
  return c.notFound();
});

export default app;
