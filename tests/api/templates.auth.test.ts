import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";

const ORIGIN = "http://localhost";

type Creds = { email: string; password: string; name: string };

const signUp = async (creds: Creds) => {
  const res = await SELF.fetch(`${ORIGIN}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(creds),
  });
  if (!res.ok) {
    throw new Error(
      `sign-up failed for ${creds.email}: ${res.status} ${await res.text()}`,
    );
  }
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error(`no set-cookie returned for ${creds.email}`);
  // Reduce "name=val; Path=/; HttpOnly, name2=val2; ..." to "name=val; name2=val2"
  const cookie = setCookie
    .split(/,(?=\s*[^;]+?=)/)
    .map((c) => c.split(";")[0].trim())
    .join("; ");
  return cookie;
};

const setUserTier = async (email: string, tier: "free" | "pro") => {
  await env.DB.prepare("UPDATE user SET tier = ? WHERE email = ?")
    .bind(tier, email)
    .run();
};

const getUserId = async (email: string): Promise<string> => {
  const row = await env.DB.prepare("SELECT id FROM user WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();
  if (!row) throw new Error(`user ${email} not found`);
  return row.id;
};

const seedTemplate = async (
  id: string,
  userId: string,
  templateName: string,
) => {
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO templates (id, templateName, templateContent, userId, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, templateName, JSON.stringify({ full_name: templateName }), userId, now, now)
    .run();
};

const readTemplate = (id: string) =>
  env.DB.prepare(
    "SELECT id, templateName FROM templates WHERE id = ?",
  )
    .bind(id)
    .first<{ id: string; templateName: string }>();

describe("templates API authorization", () => {
  let aliceCookie: string;
  let bobCookie: string;
  let carolUserId: string;

  beforeAll(async () => {
    aliceCookie = await signUp({
      email: "alice@example.com",
      password: "password1234",
      name: "Alice",
    });
    bobCookie = await signUp({
      email: "bob@example.com",
      password: "password1234",
      name: "Bob",
    });
    await signUp({
      email: "carol@example.com",
      password: "password1234",
      name: "Carol",
    });

    await setUserTier("alice@example.com", "pro");
    await setUserTier("carol@example.com", "pro");
    // bob stays "free"

    const aliceId = await getUserId("alice@example.com");
    carolUserId = await getUserId("carol@example.com");

    await seedTemplate("alice-template-1", aliceId, "alice-original");
    await seedTemplate("carol-template-1", carolUserId, "carol-original");
  });

  it("GET /api/templates only returns the caller's templates", async () => {
    const bobRes = await SELF.fetch(`${ORIGIN}/api/templates`, {
      headers: { cookie: bobCookie },
    });
    expect(bobRes.status).toBe(200);
    const bobBody = (await bobRes.json()) as Array<{ templateId: string }>;
    expect(bobBody.map((t) => t.templateId)).not.toContain("alice-template-1");
    expect(bobBody.map((t) => t.templateId)).not.toContain("carol-template-1");

    const aliceRes = await SELF.fetch(`${ORIGIN}/api/templates`, {
      headers: { cookie: aliceCookie },
    });
    expect(aliceRes.status).toBe(200);
    const aliceBody = (await aliceRes.json()) as Array<{ templateId: string }>;
    const ids = aliceBody.map((t) => t.templateId);
    expect(ids).toContain("alice-template-1");
    expect(ids).not.toContain("carol-template-1");
  });

  it("POST /api/templates rejects free-tier users", async () => {
    const res = await SELF.fetch(`${ORIGIN}/api/templates`, {
      method: "POST",
      headers: { cookie: bobCookie, "content-type": "application/json" },
      body: JSON.stringify({
        templateId: "bob-new-template",
        templateName: "bob-attempt",
        resume: { full_name: "Bob" },
      }),
    });
    // TODO(jobpls): handler returns 500 today; the intent is 402/403.
    expect(res.status).toBe(500);
    const body = (await res.json()) as { message?: string };
    expect(body.message).toMatch(/Upgrade to Pro/i);

    // And the row must not have been created.
    const row = await readTemplate("bob-new-template");
    expect(row).toBeNull();
  });

  it("POST /api/templates forbids overwriting another user's template", async () => {
    const res = await SELF.fetch(`${ORIGIN}/api/templates`, {
      method: "POST",
      headers: { cookie: aliceCookie, "content-type": "application/json" },
      body: JSON.stringify({
        templateId: "carol-template-1",
        templateName: "alice-overwrite-attempt",
        resume: { full_name: "Hacked by Alice" },
      }),
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("forbidden");

    const row = await readTemplate("carol-template-1");
    expect(row?.templateName).toBe("carol-original");
  });

  it("DELETE /api/templates cannot remove another user's template", async () => {
    // Bob is free-tier but the DELETE path doesn't gate on tier; it scopes by userId.
    const res = await SELF.fetch(
      `${ORIGIN}/api/templates?id=alice-template-1`,
      {
        method: "DELETE",
        headers: { cookie: bobCookie },
      },
    );
    // Handler currently returns 200 even when 0 rows match (silent no-op).
    expect(res.status).toBe(200);

    // The important assertion: the row must still exist.
    const row = await readTemplate("alice-template-1");
    expect(row).not.toBeNull();
    expect(row?.templateName).toBe("alice-original");
  });
});
