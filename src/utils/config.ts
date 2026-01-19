import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type {
  ItgreenConfig,
  WebpConfig,
  ConfigValidationResult,
} from "../types/config.js";

const CONFIG_FILE_NAME = ".itgreenrc.json";

/**
 * 현재 작업 디렉토리에서 설정 파일 경로 가져오기
 */
export function getConfigPath(): string {
  return join(process.cwd(), CONFIG_FILE_NAME);
}

/**
 * 설정 파일 존재 여부 확인
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}

/**
 * 설정 파일 로드
 */
export function loadConfig(): ItgreenConfig {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as ItgreenConfig;
  } catch (error) {
    throw new Error(
      `Failed to parse config file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * 설정 파일 저장
 */
export function saveConfig(config: ItgreenConfig): void {
  const configPath = getConfigPath();
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * WebP 설정 유효성 검증
 */
export function validateWebpConfig(config: WebpConfig): ConfigValidationResult {
  const errors: string[] = [];

  if (!config.inputPath) {
    errors.push("inputPath is required");
  }

  if (config.quality < 1 || config.quality > 100) {
    errors.push("quality must be between 1 and 100");
  }

  if (!Array.isArray(config.includePatterns)) {
    errors.push("includePatterns must be an array");
  }

  if (!Array.isArray(config.excludePatterns)) {
    errors.push("excludePatterns must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 기본 설정 생성
 */
export function createDefaultConfig(): ItgreenConfig {
  return {
    webp: {
      inputPath: "public/images",
      outputPath: "public/webp",
      quality: 80,
      includePatterns: ["**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}"],
      excludePatterns: ["**/node_modules/**"],
    },
    genImg: {
      inputPath: "public/images",
      outputPath: "src/generated/path/images.ts",
      displayName: "IMAGES",
      basePath: "/",
      includingPattern: ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
      ignoredPattern: ["**/node_modules/**"],
    },
    genRoute: {
      inputPath: "src/pages",
      outputPath: "src/generated/path/routes.ts",
      displayName: "ROUTES",
      ignoredPattern: [
        "layout.tsx",
        "loading.tsx",
        "error.tsx",
        "not-found.tsx",
        "template.tsx",
      ],
      includingPattern: ["**/*.tsx"],
    },
  };
}
