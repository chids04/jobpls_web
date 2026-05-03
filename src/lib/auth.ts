import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";

const createAuth = (env?: Env) => {
  const db = env?.DB ? createDb(env.DB) : ({} as any);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    baseURL: env?.BETTER_AUTH_URL,
    trustedOrigins: ["https://jobpls.lol"],
    secret: env?.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        tier: {
          type: "string",
          required: true,
          defaultValue: "free",
          input: false,
        },
      },
    },
  });
};

export const auth = createAuth();
export type Auth = ReturnType<typeof createAuth>;

export type Session = typeof auth.$Infer.Session;

export { createAuth };
