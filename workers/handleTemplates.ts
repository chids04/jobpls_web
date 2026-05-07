import { createAuth } from "@/lib/auth";
import { createDb } from "@/db";
import { templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ResumeTemplate } from "@/lib/schemas";
import { track } from "./analytics";

export const handleTemplates = async (request: Request, env: Env) => {
  if (!env.DB) {
    console.log("Database not initalised");
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;

  const db = createDb(env.DB);
  const url = new URL(request.url);

  // handle get request: fetch all templates for the user
  if (request.method === "GET") {
    try {
      const userTemplates = await db
        .select()
        .from(templates)
        .where(eq(templates.userId, userId));

      const now = new Date();
      const results = userTemplates.map((row) => ({
        templateId: row.id,
        templateName: row.templateName,
        resume:
          typeof row.templateContent === "string"
            ? JSON.parse(row.templateContent)
            : row.templateContent,
        createdAt: row.createdAt ?? now,
        updatedAt: row.updatedAt ?? now,
      }));

      return new Response(JSON.stringify(results), {
        headers: { "content-type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ message: e.message }), {
        status: 500,
      });
    }
  }

  // handle post request: save or update a template
  if (request.method === "POST") {
    if (session.user.tier == "free") {
      return new Response(
        JSON.stringify({ message: "Upgrade to Pro for cloud sync" }),
        { status: 500 },
      );
    }

    try {
      const template = await request.json<ResumeTemplate>();

      if (!template || !template.templateName || !template.templateId) {
        return new Response(JSON.stringify({ error: "missing fields" }), {
          status: 400,
        });
      }

      const existing = await db
        .select({ userId: templates.userId })
        .from(templates)
        .where(eq(templates.id, template.templateId))
        .limit(1);

      if (existing.length > 0 && existing[0].userId !== userId) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
        });
      }

      const contentStr = JSON.stringify(template.resume);

      await db
        .insert(templates)
        .values({
          id: template.templateId,
          templateName: template.templateName,
          templateContent: contentStr,
          userId,
        })
        .onConflictDoUpdate({
          target: templates.id,
          set: {
            templateName: template.templateName,
            templateContent: contentStr,
          },
        });

      track(env, "template_saved", { userId });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
      console.error(e);
      track(env, "template_saved_error", { userId, tags: [e.message ?? ""] });
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  }

  // handle delete request: delete a template
  if (request.method === "DELETE") {
    try {
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "missing id" }), {
          status: 400,
        });
      }

      await db
        .delete(templates)
        .where(and(eq(templates.id, id), eq(templates.userId, userId)));

      track(env, "template_deleted", { userId });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
      console.error(e);
      track(env, "template_deleted_error", { userId, tags: [e.message ?? ""] });
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  }

  return new Response("method not allowed", { status: 403 });
};
