import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { Hono } from "hono";
import { router } from "./router.ts";
import { registerAuthRoutes } from "./auth.ts";

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
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  let currentUserId: string | undefined;
  if (token) {
    const session = await c.env.DB.prepare(
      "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')",
    )
      .bind(token)
      .first<{ user_id: string }>();
    currentUserId = session?.user_id;
  }

  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { DB: c.env.DB, currentUserId },
  });
  if (matched) return response;
  return c.notFound();
});

export default app;
