import type { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  SSO_SERVICE_ID: string;
  SSO_ISSUER: string;
  SSO_AUDIENCE: string; // 空の場合は検証をスキップ
  // misskey.io SP 設定の publicKey (RS256 公開鍵の JWK JSON 文字列)
  // wrangler secret put SSO_JWT_PUBLIC_KEY で設定すること
  SSO_JWT_PUBLIC_KEY: string;
};

// JWTIdentifyProviderService.ts のペイロード定義に準拠
interface SsoJwtPayload {
  sub: string; // Misskey 内部ユーザー ID
  iss: string;
  aud?: string | string[];
  exp: number;
  iat: number;
  jti: string;
  preferred_username: string; // Misskey ユーザー名
  name: string;
  given_name?: string;
  family_name: string;
  profile: string;
  picture?: string;
  email: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  updated_at: number;
  admin: boolean;
  moderator: boolean;
  roles: string[];
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyJwt(
  token: string,
  publicKeyJwk: string,
  issuer: string,
  audience: string,
): Promise<SsoJwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  let header: { alg: string };
  let payload: SsoJwtPayload;
  try {
    header = JSON.parse(new TextDecoder().decode(base64urlDecode(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
  } catch {
    return null;
  }

  if (header.alg !== "RS256") return null;

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicKeyJwk) as JsonWebKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return null;
  }

  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64urlDecode(sigB64),
    new TextEncoder().encode(`${headerB64}.${payloadB64}`),
  );
  if (!isValid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  if (payload.iss !== issuer) return null;

  if (audience) {
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud ?? ""];
    if (!aud.includes(audience)) return null;
  }

  if (!payload.preferred_username) return null;

  return payload;
}

export function registerAuthRoutes(app: Hono<{ Bindings: Bindings }>) {
  // SSO 開始: misskey.io の JWT SSO ページへリダイレクト
  app.get("/auth/login", (c) => {
    const returnTo = c.req.query("return_to") ?? "/";
    const serviceId = c.env.SSO_SERVICE_ID;
    if (!serviceId) {
      return c.json({ error: "SSO not configured" }, 503);
    }
    const ssoUrl =
      `${c.env.SSO_ISSUER}/sso/jwt/${serviceId}` + `?return_to=${encodeURIComponent(returnTo)}`;
    return c.redirect(ssoUrl);
  });

  app.post("/auth/verify-jwt", async (c) => {
    let body: { jwt?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }

    const { jwt } = body;
    if (!jwt) {
      return c.json({ error: "Missing jwt" }, 400);
    }

    const payload = await verifyJwt(
      jwt,
      c.env.SSO_JWT_PUBLIC_KEY,
      c.env.SSO_ISSUER,
      c.env.SSO_AUDIENCE,
    );
    if (!payload) {
      return c.json({ error: "Invalid or expired JWT" }, 401);
    }

    return c.json({
      jwt,
      userId: payload.preferred_username,
      name: payload.name,
      picture: payload.picture ?? null,
    });
  });

  app.post("/auth/logout", async (c) => {
    return c.json({ ok: true });
  });
}

export { verifyJwt, type SsoJwtPayload, type Bindings };
