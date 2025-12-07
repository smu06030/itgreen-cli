import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { Eta } from "eta";
import { inspect } from "util";
import * as prettier from "prettier";
import { convertFilePathToObject } from "../../utils/file-scanner.js";
import { flatObject } from "../../utils/object-flattener.js";
import { toSnakeUpperCase } from "../../utils/format.js";
import type { GenImgConfig, ImageObject } from "../../types/gen-img.js";

// Default configuration
const DEFAULT_CONFIG: GenImgConfig = {
  inputPath: "public",
  outputPath: "src/generated/images.ts",
  displayName: "IMAGES",
  basePath: "/",
  includingPattern: ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
  ignoredPattern: ["*node_module*"],
};

/**
 * Merges user config with default config
 */
function getImageConfig(
  userConfig: Partial<GenImgConfig>
): Required<GenImgConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    formatKey: userConfig.formatKey || toSnakeUpperCase,
  } as Required<GenImgConfig>;
}

/**
 * Formats TypeScript code using Prettier
 */
async function prettierString(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    quoteProps: "as-needed",
  });
}

/**
 * Main function to generate image object TypeScript file
 */
export async function generateImageObj(
  userConfig: Partial<GenImgConfig>
): Promise<void> {
  // 1. Merge configuration with defaults
  const config = getImageConfig(userConfig);
  const {
    inputPath,
    outputPath,
    displayName,
    basePath,
    includingPattern,
    ignoredPattern,
    formatKey,
  } = config;

  // 2. Check if input directory exists
  const absoluteInputPath = resolve(process.cwd(), inputPath);
  if (!existsSync(absoluteInputPath)) {
    throw new Error(`Input path does not exist: ${absoluteInputPath}`);
  }

  // 3. Scan files and create nested object structure
  const imageObject = convertFilePathToObject(absoluteInputPath, {
    includingPattern,
    ignoredPattern,
    basePath,
    formatKey,
    formatValue: (info) => ({
      src: info.path,
      alt: info.key.toLowerCase().replace(/_/g, "-"),
    }),
  });

  // 4. Flatten nested object
  const flattenedObject = flatObject(imageObject, {
    formatKey: (parent, child) => {
      if (!parent) return child;
      // Both parent and child are already in SNAKE_UPPER_CASE
      // Just join them with underscore
      return `${parent}_${child}`;
    },
    isValueType: (value): value is ImageObject => {
      return (
        typeof value === "object" &&
        value !== null &&
        "src" in value &&
        "alt" in value
      );
    },
  });

  // 5. Render template using Eta
  const eta = new Eta({ autoEscape: false });
  const templateString =
    "export const <%= it.displayName %> = <%= it.imgObject %> as const;";

  const code = eta.renderString(templateString, {
    imgObject: JSON.stringify(flattenedObject, null, 2),
    displayName,
  });

  // 6. Format with Prettier
  const formattedCode = await prettierString(code);

  // 7. Ensure output directory exists
  const absoluteOutputPath = resolve(process.cwd(), outputPath);
  const outputDir = dirname(absoluteOutputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 8. Write to file
  writeFileSync(absoluteOutputPath, formattedCode, "utf-8");
}
