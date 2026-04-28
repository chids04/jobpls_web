import { onAuth } from "./handleAuth";
import { handleTierUpgrade } from "./handleTierUpgrade";
import { handleDevSeed } from "./handleDev";
import { handleTemplates } from "./handleTemplates";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    const paymentsEnabled = (env.FEATURE_PAYMENTS as string) === "true";
    const devSeedEnabled = (env.FEATURE_DEV_SEED as string) === "true";

    if (url.pathname.startsWith("/api/auth")) {
      return onAuth(request, env);
    } else if (
      paymentsEnabled &&
      url.pathname.startsWith("/api/upgrade") &&
      request.method == "POST"
    ) {
      return handleTierUpgrade(request, env);
    } else if (devSeedEnabled && url.pathname === "/api/dev/seed") {
      return handleDevSeed(request, env);
    } else if (url.pathname.startsWith("/api/templates")) {
      return handleTemplates(request, env);
    }

    return new Response("Hello World!");
  },
};
