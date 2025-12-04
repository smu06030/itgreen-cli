import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type {
  ItgreenConfig,
  WebpConfig,
  ConfigValidationResult,
} from "../types/config.js";

const CONFIG_FILE_NAME = ".itgreenrc.json";

/**
 * Get config file path from current working directory
 */
export function getConfigPath(): string {
  return join(process.cwd(), CONFIG_FILE_NAME);
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}

/**
 * Load config file
 */
export function loadConfig(): ItgreenConfig {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as ItgreenConfig;
  } catch (error) {
    throw new Error(
      `Failed to parse config file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Save config file
 */
export function saveConfig(config: ItgreenConfig): void {
  const configPath = getConfigPath();
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Validate WebP config
 */
export function validateWebpConfig(config: WebpConfig): ConfigValidationResult {
  const errors: string[] = [];

  if (!config.inputPath) {
    errors.push("inputPath is required");
  }

  if (config.quality < 1 || config.quality > 100) {
    errors.push("quality must be between 1 and 100");
  }

  if (!Array.isArray(config.includePatterns)) {
    errors.push("includePatterns must be an array");
  }

  if (!Array.isArray(config.excludePatterns)) {
    errors.push("excludePatterns must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default config
 */
export function createDefaultConfig(): ItgreenConfig {
  return {
    webp: {
      inputPath: "public/images",
      outputPath: "public/webp",
      quality: 80,
      includePatterns: ["*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}"],
      excludePatterns: ["**/node_modules/**"],
    },
  };
}
