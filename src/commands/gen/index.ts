import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { loadConfig } from "../../utils/config.js";
import { generateImageObj } from "./generate-image-obj.js";

/**
 * gen:img command handler
 */
async function genImgAction() {
  const spinner = ora("Generating image paths...").start();

  try {
    // Load configuration
    const config = await loadConfig();

    if (!config.genImg) {
      spinner.fail(
        chalk.red(
          "No gen:img configuration found in .itgreenrc.json. Run 'itgreen init' to create a config file."
        )
      );
      process.exit(1);
    }

    // Generate image object
    await generateImageObj(config.genImg);

    spinner.succeed(
      chalk.green(
        `✨ Successfully generated image paths at ${config.genImg.outputPath || "src/generated/images.ts"}`
      )
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to generate image paths"));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

/**
 * Register gen:img command
 */
export function registerGenCommands(program: Command): void {
  program
    .command("gen:img")
    .description("Generate TypeScript image path constants from directory")
    .action(genImgAction);
}
