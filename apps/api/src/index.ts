import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { Hono } from "hono";
import { router } from "./router.ts";
import { registerAuthRoutes } from "./libs/auth.ts";

type Bindings = {
  DB: D1Database;
  SSO_SERVICE_ID: string;
  SSO_ISSUER: string;
  SSO_AUDIENCE: string;
  SSO_JWT_PUBLIC_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

registerAuthRoutes(app);

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
    context: {
      DB: c.env.DB,
      headers: c.req.raw.headers,
      SSO_JWT_PUBLIC_KEY: c.env.SSO_JWT_PUBLIC_KEY,
      SSO_ISSUER: c.env.SSO_ISSUER,
      SSO_AUDIENCE: c.env.SSO_AUDIENCE,
    },
  });
  if (matched) return response;
  return c.notFound();
});

export default app;
