import { createAuth } from "@/lib/auth";

export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  const auth = createAuth(env.DB);

  // verify session
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify(session.user), {
    headers: { "content-type": "application/json" },
  });
};
