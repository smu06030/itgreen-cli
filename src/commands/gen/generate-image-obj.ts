import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { Eta } from "eta";
import { inspect } from "util";
import * as prettier from "prettier";
import { convertFilePathToObject } from "../../utils/file-scanner.js";
import { flatObject } from "../../utils/object-flattener.js";
import { toSnakeUpperCase } from "../../utils/format.js";
import type { GenImgConfig, ImageObject } from "../../types/gen-img.js";

// 기본 설정
const DEFAULT_CONFIG: GenImgConfig = {
  inputPath: "public",
  outputPath: "src/generated/images.ts",
  displayName: "IMAGES",
  basePath: "/",
  includingPattern: ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
  ignoredPattern: ["*node_module*"],
};

/**
 * 사용자 설정을 기본 설정과 병합
 */
function getImageConfig(
  userConfig: Partial<GenImgConfig>,
): Required<GenImgConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    formatKey: userConfig.formatKey || toSnakeUpperCase,
  } as Required<GenImgConfig>;
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
 * 이미지 객체 TypeScript 파일 생성 메인 함수
 */
export async function generateImageObj(
  userConfig: Partial<GenImgConfig>,
): Promise<void> {
  // 1. 기본 설정과 병합
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

  // 2. 입력 디렉토리 존재 여부 확인
  const absoluteInputPath = resolve(process.cwd(), inputPath);
  if (!existsSync(absoluteInputPath)) {
    throw new Error(`Input path does not exist: ${absoluteInputPath}`);
  }

  // 3. 파일 스캔 및 중첩 객체 구조 생성
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

  // 4. 중첩 객체 평탄화
  const flattenedObject = flatObject(imageObject, {
    formatKey: (parent, child) => {
      if (!parent) return child;
      // parent와 child 모두 이미 SNAKE_UPPER_CASE 형식
      // 언더스코어로 단순 연결
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

  // 5. Eta 템플릿을 사용하여 렌더링
  const eta = new Eta({ autoEscape: false });
  const templateString =
    "export const <%= it.displayName %> = <%= it.imgObject %> as const;";

  const code = eta.renderString(templateString, {
    imgObject: JSON.stringify(flattenedObject, null, 2),
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
