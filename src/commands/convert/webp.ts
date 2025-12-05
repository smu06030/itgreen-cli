import webp from "webp-converter";
import ora from "ora";
import * as path from "path";
import { glob } from "glob";
import type { WebpConfig, ConvertResult } from "../../types/index.js";
import { logger } from "../../utils/logger.js";
import { dirExists, changeExtension } from "../../utils/file.js";
import { mkdirSync } from "fs";

// webp-converter setup
webp.grant_permission();

/**
 * Convert PNG/JPG files to WebP format using config
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

  // Check if input directory exists
  if (!dirExists(inputPath)) {
    logger.error(`Input directory not found: ${inputPath}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!dirExists(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  // Spinner for progress
  const spinner = ora("Searching for image files...").start();

  try {
    // Find files using glob patterns
    const allFiles: string[] = [];

    for (const pattern of includePatterns) {
      const files = await glob(pattern, {
        cwd: inputPath,
        ignore: excludePatterns,
        absolute: false,
      });
      allFiles.push(...files);
    }

    // Remove duplicates
    const uniqueFiles = [...new Set(allFiles)];

    if (uniqueFiles.length === 0) {
      spinner.warn("No image files found matching the patterns.");
      return { success: [], failed: [] };
    }

    spinner.succeed(`Found ${uniqueFiles.length} image file(s).`);

    const result: ConvertResult = { success: [], failed: [] };

    // Convert each file
    for (let i = 0; i < uniqueFiles.length; i++) {
      const file = uniqueFiles[i];
      const fileName = path.basename(file);
      const inputFilePath = path.join(inputPath, file);
      const outputFilePath = path.join(
        outputPath,
        changeExtension(file, "webp")
      );

      // Ensure output subdirectory exists
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

    // Summary
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
