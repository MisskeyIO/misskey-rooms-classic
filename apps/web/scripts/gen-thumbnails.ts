/**
 * Thumbnail generator for furniture items.
 *
 * Usage:
 *   vp run web#gen-thumbnails
 *
 * Requires a running Vite dev server (vp run web#dev).
 * By default connects to http://localhost:5173.
 * Override with: VITE_URL=http://localhost:5174 vp run web#gen-thumbnails
 */

/// <reference types="node" />

import { chromium } from "playwright";
import { furnitureDefs } from "@misskey-rooms/shared";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.VITE_URL ?? "http://localhost:5173";
const THUMBNAIL_SIZE = 200;
const DEVICE_SCALE = 2;
const LOAD_TIMEOUT_MS = 15_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_BASE = path.resolve(__dirname, "../public/room/furnitures");

async function main() {
  console.log(`Connecting to dev server at ${BASE_URL} ...`);

  // Verify the dev server is reachable
  try {
    const res = await fetch(`${BASE_URL}/thumbnail-gen.html`, {
      // node 18+ fetch uses IPv6 by default; force IPv4 via 127.0.0.1 fallback
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok && res.status !== 304) throw new Error(`HTTP ${res.status}`);
  } catch {
    // Try 127.0.0.1 fallback when localhost resolves to ::1 but server binds IPv4
    const ipv4Url = BASE_URL.replace("localhost", "127.0.0.1");
    try {
      const res2 = await fetch(`${ipv4Url}/thumbnail-gen.html`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res2.ok && res2.status !== 304) throw new Error(`HTTP ${res2.status}`);
      // Server is on IPv4, rewrite BASE_URL for the rest of the run
      (globalThis as Record<string, unknown>).__VITE_URL = ipv4Url;
    } catch {
      console.error(
        `\nCannot reach ${BASE_URL}.\nPlease start the dev server first:\n  vp run web#dev\n`,
      );
      process.exit(1);
    }
  }

  // Use the resolved base URL for all subsequent navigation
  const resolvedBase: string =
    ((globalThis as Record<string, unknown>).__VITE_URL as string | undefined) ?? BASE_URL;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE },
    deviceScaleFactor: DEVICE_SCALE,
  });
  const page = await context.newPage();

  let ok = 0;
  let fail = 0;

  for (const def of furnitureDefs) {
    const url = `${resolvedBase}/thumbnail-gen.html?id=${encodeURIComponent(def.id)}`;
    const outPath = path.join(OUT_BASE, def.id, "thumbnail.png");

    try {
      await page.goto(url, { waitUntil: "networkidle" });

      // Wait until Three.js signals rendering is done
      await page.waitForSelector("canvas[data-loaded='true']", {
        timeout: LOAD_TIMEOUT_MS,
      });

      // One extra frame for WebGL to flush
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));

      await page.locator("canvas").screenshot({ path: outPath });

      console.log(`  [ok] ${def.id}`);
      ok++;
    } catch (e) {
      console.error(`  [fail] ${def.id}: ${(e as Error).message}`);
      fail++;
    }
  }

  await browser.close();

  console.log(`\nDone: ${ok} ok, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
