import { onAuth } from "./onAuth";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth")) {
      return onAuth(request, env);
    }

    return new Response("Hello World!");
  },
};
