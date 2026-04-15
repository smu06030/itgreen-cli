import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, extname, join } from "path";
import { pathToFileURL } from "url";
import type {
  ItgreenConfig,
  WebpConfig,
  ConfigValidationResult,
} from "../types/config.js";

const CONFIG_FILE_NAME = "itgreen.config.js";

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

function shouldLoadFromTempMjs(configPath: string): boolean {
  if (extname(configPath) !== ".js") {
    return false;
  }

  const packageJsonPath = join(process.cwd(), "package.json");

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    type?: string;
  };

  if (packageJson.type === "module") {
    return false;
  }

  const configSource = readFileSync(configPath, "utf8");

  return /\bexport\s+default\b|\bimport\s/.test(configSource);
}

async function importConfigModule(configPath: string) {
  if (!shouldLoadFromTempMjs(configPath)) {
    const fileUrl = pathToFileURL(configPath).href;
    return import(`${fileUrl}?t=${Date.now()}`);
  }

  const tempConfigPath = join(
    dirname(configPath),
    `.itgreen.config.${process.pid}.${Date.now()}.mjs`,
  );

  writeFileSync(tempConfigPath, readFileSync(configPath, "utf8"));

  try {
    const fileUrl = pathToFileURL(tempConfigPath).href;
    return await import(`${fileUrl}?t=${Date.now()}`);
  } finally {
    rmSync(tempConfigPath, { force: true });
  }
}

/**
 * 설정 파일 로드
 */
export async function loadConfig(): Promise<ItgreenConfig> {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    const module = await importConfigModule(configPath);
    return module.default as ItgreenConfig;
  } catch (error) {
    throw new Error(
      `Failed to load config file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
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
 * 기본 설정 파일 내용 생성 (한국어 주석 포함)
 */
export function createDefaultConfigContent(): string {
  return `/** @type {import('@smu06030/itgreen-cli').ItgreenConfig} */
export default {
  // ============================================================
  // WebP 이미지 변환 설정 (convert:webp)
  // ============================================================
  webp: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "public/images",
    /** 변환된 WebP 파일이 생성될 경로입니다. */
    outputPath: "public/webp",
    /** 변환되는 이미지의 품질을 결정합니다. (1~100) */
    quality: 80,
    /** 변환할 이미지 파일을 판별하는 glob 패턴입니다. 패턴과 일치하는 파일만 변환됩니다. */
    includePatterns: ["**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}"],
    /** 제외할 이미지 파일을 판별하는 glob 패턴입니다. 패턴과 일치하는 파일은 변환에서 제외됩니다. */
    excludePatterns: ["**/node_modules/**"],
  },

  // ============================================================
  // 이미지 경로 상수 생성 설정 (gen:img)
  // ============================================================
  genImg: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "public/images",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/images.ts",
    /** 생성될 이미지 객체의 이름입니다. */
    displayName: "IMAGES",
    /** 생성될 객체의 value에 할당될 경로의 base-path입니다. */
    basePath: "/",
    /** 포함할 이미지 파일을 판별하는 패턴입니다. 파일이름이 패턴과 일치할 경우에만 포함됩니다. */
    includingPattern: ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
    /** 제외할 이미지 파일을 판별하는 패턴입니다. 파일이름이 패턴과 일치할 경우 제외됩니다. */
    ignoredPattern: ["**/node_modules/**"],
  },

  // ============================================================
  // 라우트 경로 상수 생성 설정 (gen:route)
  // ============================================================
  genRoute: {
    /** 조회할 page 파일들이 포함되어있는 폴더입니다. */
    inputPath: "src/pages",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/routes.ts",
    /** 생성될 route 객체의 이름입니다. */
    displayName: "ROUTES",
    /** 제외될 route 파일의 glob 패턴입니다. */
    ignoredPattern: [
      "layout.tsx",
      "loading.tsx",
      "error.tsx",
      "not-found.tsx",
      "template.tsx",
      "_document.tsx",
      "_app.tsx",
    ],
    /** 포함할 route 파일의 glob 패턴입니다. */
    includingPattern: ["**/*.tsx"],
  },

  // ============================================================
  // API 코드 자동 생성 설정 (gen:api)
  // ============================================================
  genApi: {
    /**
     * Swagger/OpenAPI 스키마의 URL 또는 로컬 파일(yaml, json) 경로입니다.
     * 통상적으로 백엔드 개발자에게 공유받은 swagger-url의 '/openapi.json' 경로에 해당합니다.
     */
    swaggerSchemaUrl: "",
    /** 생성될 API 파일들이 위치할 경로입니다. */
    outputPath: "src/generated/apis",
    /** React Query 훅 코드 포함 여부입니다. false일 경우 모든 Query 코드가 생성되지 않습니다. */
    includeReactQuery: true,
    /** React Infinite Query 훅 코드 포함 여부입니다. */
    includeReactInfiniteQuery: true,
    /** API의 axios 요청 인스턴스 import 경로입니다. */
    axiosInstancePath: "@apis/_axios/instance",
    /**
     * Infinite Query를 생성할 함수 필터입니다.
     * - keywords: API의 queryParams key에 해당 키워드가 모두 포함된 항목만 생성됩니다. (AND 연산)
     *   예) ["limit", "offset"] → limit과 offset이 모두 있는 API만 대상
     * - nextKey: InfiniteQuery의 nextPage와 nextPageParam을 구하기 위해 사용됩니다.
     */
    paginations: [
      {
        keywords: ["cursor"],
        nextKey: "cursor",
      },
    ],
  },
};
`;
}
