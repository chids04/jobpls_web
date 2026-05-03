import { createAuth } from "@/lib/auth";

export const onAuth = async (request: Request, env: Env) => {
  const auth = createAuth(env);
  return auth.handler(request);
};
