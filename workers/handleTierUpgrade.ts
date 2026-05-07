import { createAuth } from "@/lib/auth";
import { createDb } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { track } from "./analytics";

export async function handleTierUpgrade(request: Request, env: Env) {
  const auth = createAuth(env.DB);

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ message: "unauthorized" }), {
      status: 401,
    });
  }

  if (session.user.tier == "pro") {
    return new Response(JSON.stringify({ message: "already pro" }), {
      status: 401,
    });
  }

  try {
    const db = createDb(env.DB);
    await db
      .update(user)
      .set({ tier: "pro" })
      .where(eq(user.id, session.user.id));

    track(env, "tier_upgraded", { userId: session.user.id });
    return new Response(JSON.stringify({ message: "upgraded to pro tier" }), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    track(env, "tier_upgrade_error", {
      userId: session.user.id,
      tags: [error?.message ?? ""],
    });
    return new Response(JSON.stringify({ message: "failed to update tier" }), {
      status: 500,
    });
  }
}
