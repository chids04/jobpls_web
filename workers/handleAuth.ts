import { createAuth } from "@/lib/auth";

export const onAuth = async (request: Request, env: Env) => {
  const auth = createAuth(env.DB);
  return auth.handler(request);
};
