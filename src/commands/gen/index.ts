import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { loadConfig } from "../../utils/config.js";
import { generateImageObj } from "./generate-image-obj.js";
import { generateRoute } from "./generate-route.js";

/**
 * gen:img 명령어 핸들러
 */
async function genImgAction() {
  const spinner = ora("Generating image paths...").start();

  try {
    // 설정 로드
    const config = await loadConfig();

    if (!config.genImg) {
      spinner.fail(
        chalk.red(
          "No gen:img configuration found in .itgreenrc.json. Run 'itgreen init' to create a config file.",
        ),
      );
      process.exit(1);
    }

    // 이미지 객체 생성
    await generateImageObj(config.genImg);

    spinner.succeed(
      chalk.green(
        `✨ Successfully generated image paths at ${config.genImg.outputPath || "src/generated/path/images.ts"}`,
      ),
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to generate image paths"));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

/**
 * gen:route 명령어 핸들러
 */
async function genRouteAction() {
  const spinner = ora("Generating route paths...").start();

  try {
    // 설정 로드
    const config = await loadConfig();

    if (!config.genRoute) {
      spinner.fail(
        chalk.red(
          "No gen:route configuration found in .itgreenrc.json. Run 'itgreen init' to create a config file.",
        ),
      );
      process.exit(1);
    }

    // 라우트 객체 생성
    await generateRoute(config.genRoute);

    spinner.succeed(
      chalk.green(
        `✨ Successfully generated route paths at ${config.genRoute.outputPath || "src/generated/path/routes.ts"}`,
      ),
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to generate route paths"));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

/**
 * gen 명령어들 등록
 */
export function registerGenCommands(program: Command): void {
  program
    .command("gen:img")
    .description("Generate TypeScript image path constants from directory")
    .action(genImgAction);

  program
    .command("gen:route")
    .description("Generate TypeScript route path constants from pages")
    .action(genRouteAction);
}
