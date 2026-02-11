import { writeFileSync } from "fs";
import { Command } from "commander";
import {
  configExists,
  createDefaultConfigContent,
  getConfigPath,
} from "../../utils/config.js";
import { logger } from "../../utils/logger.js";
import ora from "ora";

export function registerInitCommands(program: Command): void {
  program
    .command("init")
    .description("Initialize config file for the CLI")
    .action(async () => {
      const spinner = ora("Creating config file...").start();

      try {
        const configPath = getConfigPath();

        if (configExists()) {
          spinner.warn("Config file already exists. Overwriting...");
        }

        const content = createDefaultConfigContent();
        writeFileSync(configPath, content, "utf-8");

        spinner.succeed("Config file created successfully!");
        logger.success(`\nConfig file created at: ${configPath}`);
        logger.log(
          "\nYou can now edit the config file and run commands.",
        );
      } catch (error) {
        spinner.fail("Failed to create config file");
        logger.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
}
