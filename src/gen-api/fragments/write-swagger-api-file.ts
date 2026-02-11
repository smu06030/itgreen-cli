import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import prettier from "prettier";
import { TYPE_FILE, UTIL_FILE, QUERY_HOOK_INDICATOR } from "../gen-api.data.js";
import { splitHookContents } from "./split-hook-contents.js";

async function formatAndWrite(filePath: string, content: string) {
  const formatted = await prettier.format(content, {
    parser: "babel-ts",
    plugins: ["prettier-plugin-organize-imports"],
  });
  writeFileSync(filePath, formatted);

  const final = await prettier.format(formatted, { parser: "typescript" });
  writeFileSync(filePath, final);
}

function writeRaw(filePath: string, content: string) {
  writeFileSync(filePath, content);
}

interface SwaggerFile {
  fileName: string;
  fileExtension: string;
  fileContent: string;
}

interface WriteOptions {
  output: { files: SwaggerFile[] };
  outputPath: string;
}

export async function writeSwaggerApiFile({ output, outputPath }: WriteOptions) {
  for (const file of output.files) {
    const name = file.fileName + file.fileExtension;
    const content = file.fileContent;

    const isTypeFile = TYPE_FILE.includes(name);
    const isUtilFile = UTIL_FILE.includes(name);
    const isHttpClient = name === "http-client.ts";
    const hasHookIndicator = content.includes(QUERY_HOOK_INDICATOR);
    const moduleName = name.replace(".ts", "");

    const getDir = () => {
      if (isUtilFile) return resolve(outputPath, "@utils");
      if (isTypeFile) return resolve(outputPath, "@types");
      if (isHttpClient) return resolve(outputPath, `@${moduleName}`);
      return resolve(outputPath, moduleName);
    };

    const dir = getDir();
    mkdirSync(dir, { recursive: true });

    if (isHttpClient) {
      writeRaw(resolve(dir, "index.ts"), content);
      continue;
    }

    if (hasHookIndicator) {
      const { apiContents, hookContents } = splitHookContents(
        moduleName,
        content,
      );
      await formatAndWrite(resolve(dir, `${moduleName}.api.ts`), apiContents);
      await formatAndWrite(
        resolve(dir, `${moduleName}.query.ts`),
        hookContents,
      );
      continue;
    }

    writeRaw(resolve(dir, name), content);
  }
}
