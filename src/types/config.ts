export interface WebpConfig {
  inputPath: string;
  outputPath?: string;
  quality: number;
  includePatterns: string[];
  excludePatterns: string[];
}

export interface ItgreenConfig {
  webp?: WebpConfig;
  genImg?: Partial<import("./gen-img.js").GenImgConfig>;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}
