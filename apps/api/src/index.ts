import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { Hono } from "hono";
import { router } from "./router.ts";
import { registerAuthRoutes } from "./libs/auth.ts";

const app = new Hono<{ Bindings: Env }>();

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
      MISSKEY_ROOMS: c.env.MISSKEY_ROOMS,
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
