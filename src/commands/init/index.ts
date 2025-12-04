import { Command } from "commander";
import {
  configExists,
  saveConfig,
  createDefaultConfig,
  getConfigPath,
} from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import ora from "ora";

export function registerInitCommands(program: Command): void {
  program
    .command("init")
    .description("Initialize config file for the CLI")
    .option("-f, --force", "Overwrite existing config file", false)
    .action(async (options) => {
      const spinner = ora("Creating config file...").start();

      try {
        const configPath = getConfigPath();

        if (configExists() && !options.force) {
          spinner.warn("Config file already exists. Use --force to overwrite.");
          logger.log(`Config file location: ${configPath}`);
          return;
        }

        const config = createDefaultConfig();
        saveConfig(config);

        spinner.succeed("Config file created successfully!");
        logger.success(`\nConfig file created at: ${configPath}`);
        logger.log("\nDefault configuration:");
        logger.log(JSON.stringify(config, null, 2));
        logger.log("\nYou can now edit the config file and run commands.");
      } catch (error) {
        spinner.fail("Failed to create config file");
        logger.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    });
}
