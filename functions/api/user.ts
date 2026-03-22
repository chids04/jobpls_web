export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  // mock user id until clerk is fully wired up
  const userId = request.headers.get("x-user-id") || "mock_user_123";

  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    // 1. fetch user tier and credits from D1
    const user = await env.DB.prepare("select tier, credits from users where id = ?").bind(userId).first();

    if (!user) {
      // 2. if user doesn't exist, create a free tier record for them
      await env.DB.prepare("insert into users (id, tier, credits) values (?, ?, ?)").bind(userId, "free", 0).run();
      
      return new Response(JSON.stringify({ tier: "free", credits: 0 }), {
        headers: { "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify(user), {
      headers: { "content-type": "application/json" }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
