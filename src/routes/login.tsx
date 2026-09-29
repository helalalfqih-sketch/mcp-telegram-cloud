import { Hono } from "hono";
import { LoginPage } from "../pages/LoginPage.js";
import { handleQrLogin } from "../qr-login.js";
import { detectRequestLocale, islandScripts, reactPagesAvailable, renderReactPage } from "../react-pages.js";
import type { SessionManager } from "../session-manager.js";

export interface LoginRoutesDeps {
  sessions: SessionManager;
}

export function createLoginRoutes({ sessions }: LoginRoutesDeps): Hono {
  const app = new Hono();

  app.get("/", async (c) => {
    if (reactPagesAvailable()) {
      const locale = detectRequestLocale(c);
      const html = await renderReactPage("login", {
        locale,
        scripts: islandScripts("language-switcher", "qr-flow"),
      });
      return c.html(html);
    }
    return c.html(<LoginPage />);
  });

  // Direct-link flow: no username is required. Any Telegram account that scans
  // the QR becomes the authenticated identity; the server derives the storage
  // key from Telegram getMe() after authentication.
  //
  // userId remains accepted as an optional compatibility hint for old links.
  app.get("/qr", async (c) => {
    const userIdHint = c.req.query("userId");
    const stream = await handleQrLogin(sessions, userIdHint, c.req.raw.signal);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });

  return app;
}
