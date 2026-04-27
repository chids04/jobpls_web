import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { drizzleD1Config } from "@deox/drizzle-d1-utils";

// export default defineConfig({
//   out: "./drizzle/",
//   schema: "./src/db/schema",
//   dialect: "sqlite",
//   driver: "d1-http",
//   dbCredentials: {
//     accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
//     databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
//     token: process.env.CLOUDFLARE_D1_TOKEN!,
//   },
// });
//
const env = process.env.ENV ?? "development";

export default drizzleD1Config(
  {
    out: "./src/db/migrations",
    schema: "./src/db/schema",
  },
  {
    persistTo: "./src/db/local",
    accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_D1_API_TOKEN,
    binding: process.env.CLOUDFLARE_D1_DATABASE_BINDING,
    remote: process.env.REMOTE === "true" || process.env.REMOTE === "1",
    environment: env,
  },
);
