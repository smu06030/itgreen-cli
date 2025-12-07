import { readdirSync, statSync } from "fs";
import { resolve, parse, relative } from "path";
import { minimatch } from "minimatch";
import { toSnakeUpperCase, removeEmptyObject } from "./format.js";
import type { FileInfo, ImageObject } from "../types/gen-img.js";

export interface ConvertOptions {
  includingPattern: string[];
  ignoredPattern: string[];
  basePath: string;
  formatKey?: (filename: string) => string;
  formatValue: (info: FileInfo) => ImageObject;
}

/**
 * Checks if a file should be included based on glob patterns
 */
function checkFileAccess(options: {
  filename: string;
  basename: string;
  ignored: string[];
  include: string[];
}): boolean {
  const { filename, basename, ignored, include } = options;

  // Check if file matches any ignored pattern (match against full path)
  for (const pattern of ignored) {
    if (minimatch(filename, pattern, { matchBase: true })) {
      return false;
    }
  }

  // Check if file matches any include pattern (match against basename)
  for (const pattern of include) {
    if (minimatch(basename, pattern, { matchBase: true })) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively converts file paths to nested object structure
 */
export function convertFilePathToObject(
  basePath: string,
  options: ConvertOptions
): Record<string, any> {
  const result: Record<string, any> = {};
  const { includingPattern, ignoredPattern, formatKey, formatValue } = options;

  const scan = (currentPath: string, targetObject: Record<string, any>) => {
    const files = readdirSync(currentPath);

    for (const file of files) {
      const fullPath = resolve(currentPath, file);
      const parsed = parse(fullPath);
      const stats = statSync(fullPath);
      const isDirectory = stats.isDirectory();

      // Generate key for this file/directory
      const key = formatKey
        ? formatKey(parsed.name)
        : toSnakeUpperCase(parsed.name);

      if (isDirectory) {
        // Recursively scan directories
        targetObject[key] = {};
        scan(fullPath, targetObject[key]);
      } else {
        // Check if file should be included
        const isAccessible = checkFileAccess({
          filename: fullPath,
          basename: parsed.base,
          ignored: ignoredPattern,
          include: includingPattern,
        });

        if (isAccessible) {
          const relativePath = relative(basePath, fullPath);
          const pathWithBase = options.basePath
            ? `${options.basePath}/${relativePath}`.replace(/\/+/g, "/")
            : relativePath;

          targetObject[key] = formatValue({
            key,
            path: pathWithBase,
            wholePath: fullPath,
            info: parsed,
          });
        }
      }
    }
  };

  scan(basePath, result);
  return removeEmptyObject(result);
}
