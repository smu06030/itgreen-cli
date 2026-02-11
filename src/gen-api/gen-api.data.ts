import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findTemplatesRoot(): string {
  // When bundled (dist/index.js): __dirname = dist/
  const fromDist = resolve(__dirname, "templates", "swagger");
  // When in dev (src/gen-api/): __dirname = src/gen-api/
  const fromSrc = resolve(__dirname, "..", "templates", "swagger");

  if (existsSync(fromDist)) return fromDist;
  if (existsSync(fromSrc)) return fromSrc;

  throw new Error(
    `Swagger templates not found. Searched:\n  - ${fromDist}\n  - ${fromSrc}`,
  );
}

const TEMPLATES_ROOT = findTemplatesRoot();

export const CUSTOM_TEMPLATE_FOLDER = resolve(
  TEMPLATES_ROOT,
  "custom-templates",
);

export const EXTRA_TEMPLATE_FOLDER = resolve(
  TEMPLATES_ROOT,
  "extra-templates",
);

export const TYPE_FILE = [
  "react-query-type.ts",
  "data-contracts.ts",
  "util-types.ts",
];

export const UTIL_FILE = ["param-serializer-by.ts"];

export const QUERY_HOOK_INDICATOR = "@indicator-for-query-hook";
