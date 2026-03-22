import { implement } from "@orpc/server";
import { contract } from "@misskey-rooms/contract";
import { verifyJwt } from "../libs/auth.ts";

export type AuthContext = Pick<
  Env,
  "MISSKEY_ROOMS" | "SSO_JWT_PUBLIC_KEY" | "SSO_ISSUER" | "SSO_AUDIENCE"
> & {
  headers: Headers;
  currentUserId?: string;
};

const os = implement(contract).$context<AuthContext>();

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const authHeader = context.headers.get("authorization");
  const jwt = authHeader?.replace("Bearer ", "").trim();

  if (!jwt) {
    return next({ context: { currentUserId: undefined } });
  }

  const payload = await verifyJwt(
    jwt,
    context.SSO_JWT_PUBLIC_KEY,
    context.SSO_ISSUER,
    context.SSO_AUDIENCE,
  );

  return next({
    context: {
      currentUserId: payload?.preferred_username,
    },
  });
});
