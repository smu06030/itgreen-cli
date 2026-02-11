import { Command } from "commander";
import { convertToWebp } from "./webp.js";
import {
  loadConfig,
  configExists,
  validateWebpConfig,
} from "../../utils/config.js";
import { logger } from "../../utils/logger.js";

export function registerConvertCommands(program: Command): void {
  program
    .command("convert:webp")
    .description("Convert PNG/JPG files to WebP format based on config file")
    .action(async () => {
      // 설정 파일 존재 여부 확인
      if (!configExists()) {
        logger.error(
          'Config file not found. Please run "init" command first to create a config file.',
        );
        process.exit(1);
      }

      try {
        // 설정 로드
        const config = await loadConfig();

        if (!config.webp) {
          logger.error("WebP configuration not found in config file.");
          process.exit(1);
        }

        // 설정 유효성 검증
        const validation = validateWebpConfig(config.webp);
        if (!validation.valid) {
          logger.error("Invalid WebP configuration:");
          validation.errors.forEach((error) => logger.error(`  - ${error}`));
          process.exit(1);
        }

        // 변환 실행
        await convertToWebp(config.webp);
      } catch (error) {
        logger.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
}
