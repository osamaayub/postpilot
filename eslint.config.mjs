import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Architecture rules: keep each layer honest.
const noFrameworkInCore = {
  files: ["src/features/*/domain/**", "src/features/*/service.ts", "src/features/*/ports.ts"],
  rules: {
    "no-restricted-imports": ["error", { patterns: [
      { group: ["next", "next/*", "react", "react-dom"], message: "Domain and service code must not depend on the framework." },
      { group: ["@/server/*", "drizzle-orm", "drizzle-orm/*", "pg", "openai"], message: "Use a port (interface) instead of importing infrastructure." },
    ] }],
  },
};
const noDbInUi = {
  files: ["src/app/**", "src/features/*/components/**"],
  rules: {
    "no-restricted-imports": ["error", { patterns: [
      { group: ["@/server/db", "@/server/schema", "drizzle-orm", "drizzle-orm/*", "pg"], message: "Pages and components go through a feature's server.ts or actions, never straight to the database." },
    ] }],
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  noFrameworkInCore,
  noDbInUi,
  { files: ["src/**"], ignores: ["src/lib/logger.ts"], rules: { "no-console": "error" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
