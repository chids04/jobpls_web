import { createAuth } from "@/lib/auth";

export const onRequest = async (context: any) => {
  const { request, env, params } = context;
  const auth = createAuth(env.DB);

  return auth.handler(request);
};
