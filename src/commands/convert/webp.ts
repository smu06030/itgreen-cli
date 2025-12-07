import webp from "webp-converter";
import ora from "ora";
import * as path from "path";
import { glob } from "glob";
import type { WebpConfig, ConvertResult } from "../../types/index.js";
import { logger } from "../../utils/logger.js";
import { dirExists, changeExtension } from "../../utils/file.js";
import { mkdirSync } from "fs";

// webp-converter 설정
webp.grant_permission();

/**
 * 설정을 사용하여 PNG/JPG 파일을 WebP 형식으로 변환
 */
export async function convertToWebp(
  config: WebpConfig
): Promise<ConvertResult> {
  const {
    inputPath,
    outputPath = inputPath,
    quality,
    includePatterns,
    excludePatterns,
  } = config;

  // 입력 디렉토리 존재 여부 확인
  if (!dirExists(inputPath)) {
    logger.error(`Input directory not found: ${inputPath}`);
    process.exit(1);
  }

  // 출력 디렉토리 존재 확인
  if (!dirExists(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  const spinner = ora("Searching for image files...").start();

  try {
    // glob 패턴을 사용하여 파일 찾기
    const allFiles: string[] = [];

    for (const pattern of includePatterns) {
      const files = await glob(pattern, {
        cwd: inputPath,
        ignore: excludePatterns,
        absolute: false,
      });
      allFiles.push(...files);
    }

    // 중복 제거
    const uniqueFiles = [...new Set(allFiles)];

    if (uniqueFiles.length === 0) {
      spinner.warn("No image files found matching the patterns.");
      return { success: [], failed: [] };
    }

    spinner.succeed(`Found ${uniqueFiles.length} image file(s).`);

    const result: ConvertResult = { success: [], failed: [] };

    // 각 파일 변환
    for (let i = 0; i < uniqueFiles.length; i++) {
      const file = uniqueFiles[i];
      const fileName = path.basename(file);
      const inputFilePath = path.join(inputPath, file);
      const outputFilePath = path.join(
        outputPath,
        changeExtension(file, "webp")
      );

      // 출력 하위 디렉토리 존재 확인
      const outputDir = path.dirname(outputFilePath);
      if (!dirExists(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const convertSpinner = ora(
        `[${i + 1}/${uniqueFiles.length}] Converting ${fileName}...`
      ).start();

      try {
        await webp.cwebp(inputFilePath, outputFilePath, `-q ${quality}`);
        convertSpinner.succeed(
          `${fileName} → ${path.basename(outputFilePath)}`
        );
        result.success.push(file);
      } catch (error) {
        convertSpinner.fail(`${fileName} conversion failed`);
        logger.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        result.failed.push(file);
      }
    }

    // 요약
    logger.log("");
    logger.success(
      `✨ Conversion complete: ${result.success.length} succeeded`
    );
    if (result.failed.length > 0) {
      logger.error(`❌ Conversion failed: ${result.failed.length}`);
    }

    return result;
  } catch (error) {
    spinner.fail("Error during conversion");
    logger.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
