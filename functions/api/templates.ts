import { createAuth } from "@/lib/auth";

export const onRequest = async (context: any) => {
  const { request, env } = context;
  const auth = createAuth(env.DB);

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;

  // handle get request: fetch all templates for the user
  if (request.method === "GET") {
    try {
      const { results } = await env.DB.prepare(
        "select id, name, content from templates where user_id = ?",
      )
        .bind(userId)
        .all();

      // parse the json content back into objects before sending to frontend
      const templates = results.map((row: any) => ({
        id: row.id,
        name: row.name,
        content: JSON.parse(row.content),
      }));

      return new Response(JSON.stringify(templates), {
        headers: { "content-type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  }

  // handle post request: save or update a template
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { id, name, content } = body;

      if (!id || !name || !content) {
        return new Response(JSON.stringify({ error: "missing fields" }), {
          status: 400,
        });
      }

      // we store the template content as a stringified json in the db
      const contentStr = JSON.stringify(content);

      await env.DB.prepare(
        `insert into templates (id, user_id, name, content)
         values (?, ?, ?, ?)
         on conflict(id) do update set name=excluded.name, content=excluded.content, updated_at=current_timestamp`,
      )
        .bind(id, userId, name, contentStr)
        .run();

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  }

  return new Response("method not allowed", { status: 405 });
};
