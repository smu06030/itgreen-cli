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
      // Check if config exists
      if (!configExists()) {
        logger.error(
          'Config file not found. Please run "init" command first to create a config file.'
        );
        process.exit(1);
      }

      try {
        // Load config
        const config = loadConfig();

        if (!config.webp) {
          logger.error("WebP configuration not found in config file.");
          process.exit(1);
        }

        // Validate config
        const validation = validateWebpConfig(config.webp);
        if (!validation.valid) {
          logger.error("Invalid WebP configuration:");
          validation.errors.forEach((error) => logger.error(`  - ${error}`));
          process.exit(1);
        }

        // Execute conversion
        await convertToWebp(config.webp);
      } catch (error) {
        logger.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });
}
