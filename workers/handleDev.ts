import { createAuth } from "@/lib/auth";

export const handleDevSeed = async (request: Request, env: Env) => {
  if (env.VITE_DEBUG_MENU !== "true") {
    return new Response("Not Allowed", { status: 403 });
  }

  const auth = createAuth(env.DB);
  const password = "password123";

  let isReset = false;
  if (request.method === "POST") {
    try {
      const body: any = await request.json();
      isReset = body.reset === true;
    } catch (e) {}
  }

  try {
    if (isReset) {
      console.log("🔄 Resetting user tiers...");
      await env.DB.prepare("UPDATE user SET tier = 'pro' WHERE email = ?")
        .bind("pro@test.com")
        .run();
      await env.DB.prepare("UPDATE user SET tier = 'free' WHERE email = ?")
        .bind("free@test.com")
        .run();

      return new Response(
        JSON.stringify({ success: true, message: "User tiers reset successfully" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🌱 Starting seed via Auth API...");

    try {
      await auth.api.signUpEmail({
        body: { email: "pro@test.com", password, name: "Pro User" },
      });
    } catch (e) {}

    await env.DB.prepare("UPDATE user SET tier = 'pro' WHERE email = ?")
      .bind("pro@test.com")
      .run();

    try {
      await auth.api.signUpEmail({
        body: { email: "free@test.com", password, name: "Free User" },
      });
    } catch (e) {}

    await env.DB.prepare("UPDATE user SET tier = 'free' WHERE email = ?")
      .bind("free@test.com")
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dev users seeded successfully",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Dev operation failed",
        error: e.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
