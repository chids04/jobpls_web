import { defineConfig } from "vitest/config";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const migrations = await readD1Migrations(
  resolve(here, "src/db/migrations"),
);

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          include: ["tests/schemas.test.ts"],
          environment: "node",
        },
      },
      defineWorkersProject({
        resolve: {
          alias: { "@": resolve(here, "src") },
        },
        test: {
          name: "workers",
          include: ["tests/api/**/*.test.ts"],
          setupFiles: ["./tests/api/setup.ts"],
          poolOptions: {
            workers: {
              singleWorker: true,
              isolatedStorage: true,
              wrangler: { configPath: "./wrangler.test.toml" },
              miniflare: {
                bindings: {
                  TEST_MIGRATIONS: migrations,
                  BETTER_AUTH_SECRET:
                    "test-secret-not-for-production-use-only-in-vitest-suite",
                  BETTER_AUTH_URL: "http://localhost",
                  FEATURE_PAYMENTS: "true",
                  FEATURE_DEV_SEED: "false",
                },
              },
            },
          },
        },
      }),
    ],
  },
});
