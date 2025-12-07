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
 * glob 패턴을 기반으로 파일 포함 여부 확인
 */
function checkFileAccess(options: {
  filename: string;
  basename: string;
  ignored: string[];
  include: string[];
}): boolean {
  const { filename, basename, ignored, include } = options;

  // 제외 패턴과 매칭되는지 확인 (전체 경로 기준)
  for (const pattern of ignored) {
    if (minimatch(filename, pattern, { matchBase: true })) {
      return false;
    }
  }

  // 포함 패턴과 매칭되는지 확인 (파일명 기준)
  for (const pattern of include) {
    if (minimatch(basename, pattern, { matchBase: true })) {
      return true;
    }
  }

  return false;
}

/**
 * 파일 경로를 재귀적으로 중첩된 객체 구조로 변환
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

      // 파일/디렉토리의 키 생성
      const key = formatKey
        ? formatKey(parsed.name)
        : toSnakeUpperCase(parsed.name);

      if (isDirectory) {
        // 디렉토리 재귀 스캔
        targetObject[key] = {};
        scan(fullPath, targetObject[key]);
      } else {
        // 파일 포함 여부 확인
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
