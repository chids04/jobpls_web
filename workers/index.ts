import { onAuth } from "./handleAuth";
import { handleTierUpgrade } from "./handleTierUpgrade";
import { handleDevSeed } from "./handleDev";
import { handleTemplates } from "./handleTemplates";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth")) {
      return onAuth(request, env);
    } else if (
      url.pathname.startsWith("/api/upgrade") &&
      request.method == "POST"
    ) {
      return handleTierUpgrade(request, env);
    } else if (url.pathname === "/api/dev/seed") {
      return handleDevSeed(request, env);
    } else if (url.pathname.startsWith("/api/templates")) {
      return handleTemplates(request, env);
    }

    return new Response("Hello World!");
  },
};
