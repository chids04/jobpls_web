import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";

const createAuth = (d1?: D1Database) => {
  const db = d1 ? createDb(d1) : ({} as any);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    baseURL: process.env.VITE_BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        tier: {
          type: "string",
          required: false,
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
