import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { Eta } from "eta";
import { inspect } from "util";
import * as prettier from "prettier";
import { convertFilePathToObject } from "../../utils/file-scanner.js";
import { flatObject } from "../../utils/object-flattener.js";
import { toSnakeUpperCase } from "../../utils/format.js";
import type { GenRouteConfig } from "../../types/gen-route.js";

// 기본 설정
const DEFAULT_CONFIG: GenRouteConfig = {
  inputPath: "src/pages",
  outputPath: "src/generated/path/routes.ts",
  displayName: "ROUTES",
  includingPattern: ["*.tsx", "*.ts"],
  ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
};

/**
 * 사용자 설정을 기본 설정과 병합
 */
function getRouteConfig(
  userConfig: Partial<GenRouteConfig>,
): Required<GenRouteConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    formatKey: userConfig.formatKey || toSnakeUpperCase,
  } as Required<GenRouteConfig>;
}

/**
 * Prettier를 사용하여 TypeScript 코드 포맷팅
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
 * 라우트 객체 TypeScript 파일 생성 메인 함수
 */
export async function generateRoute(
  userConfig: Partial<GenRouteConfig>,
): Promise<void> {
  // 1. 기본 설정과 병합
  const config = getRouteConfig(userConfig);
  const {
    inputPath,
    outputPath,
    displayName,
    includingPattern,
    ignoredPattern,
    formatKey: userFormatKey,
  } = config;

  // 2. 입력 디렉토리 존재 여부 확인
  const absoluteInputPath = resolve(process.cwd(), inputPath);
  if (!existsSync(absoluteInputPath)) {
    throw new Error(`Input path does not exist: ${absoluteInputPath}`);
  }

  // 3. 파일 스캔 및 중첩 객체 구조 생성
  const routeObject = convertFilePathToObject(absoluteInputPath, {
    includingPattern,
    ignoredPattern,
    basePath: "/",
    formatKey: (fileName) => {
      // index.tsx -> 'MAIN'
      // page.tsx -> 'MAIN' (App Router)
      if (fileName === "index" || fileName === "page") {
        return "MAIN";
      }

      // [id].tsx -> 'BY_ID'
      // [slug].tsx -> 'BY_SLUG'
      const match = fileName.match(/\[(.+?)\]/);
      if (match) {
        return toSnakeUpperCase(`by ${match[1]}`);
      }

      // about.tsx -> 'ABOUT'
      return toSnakeUpperCase(fileName);
    },
    formatValue: (info): string => {
      // 파일 확장자 제거 및 index/page 처리
      let route = info.path
        .replace(/\.(tsx|ts)$/, "") // 확장자 제거
        .replace(/\/page$/, "") // App Router의 /page 제거
        .replace(/\/index$/, ""); // Page Router의 /index 제거

      // 마지막 슬래시 제거
      if (route.endsWith("/")) {
        return route.substring(0, route.length - 1) || "/";
      }

      return route || "/";
    },
  });

  // 4. 중첩 객체 평탄화
  const flattenedObject = flatObject(routeObject, {
    formatKey: (parent, child) => {
      // MAIN을 제거하고 부모와 자식을 언더스코어로 결합
      const combined = [parent, child]
        .filter((key) => key && key !== "MAIN")
        .join("_");

      return combined || "MAIN";
    },
    isValueType: (value): value is string => {
      return typeof value === "string";
    },
  });

  // 5. Eta 템플릿을 사용하여 렌더링
  const eta = new Eta({ autoEscape: false });
  const templateString =
    "export const <%= it.displayName %> = <%= it.routeObject %> as const;";

  const code = eta.renderString(templateString, {
    routeObject: inspect(flattenedObject, { depth: Infinity }),
    displayName,
  });

  // 6. Prettier로 포맷팅
  const formattedCode = await prettierString(code);

  // 7. 출력 디렉토리 존재 확인
  const absoluteOutputPath = resolve(process.cwd(), outputPath);
  const outputDir = dirname(absoluteOutputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 8. 파일 작성
  writeFileSync(absoluteOutputPath, formattedCode, "utf-8");
}
