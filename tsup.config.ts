import { defineConfig } from "tsup";
import { cpSync } from "fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  clean: true,
  minify: false,
  shims: true,
  dts: false,
  sourcemap: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
  onSuccess: async () => {
    cpSync("src/templates", "dist/templates", { recursive: true });
    console.log("Copied templates to dist/templates");
  },
});
