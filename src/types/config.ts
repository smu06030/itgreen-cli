export interface WebpConfig {
  inputPath: string;
  outputPath?: string;
  quality: number;
  includePatterns: string[];
  excludePatterns: string[];
}

export interface ConvertResult {
  success: string[];
  failed: string[];
}

export interface ItgreenConfig {
  webp?: WebpConfig;
  genImg?: Partial<import("./gen-img.js").GenImgConfig>;
  genRoute?: Partial<import("./gen-route.js").GenRouteConfig>;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}
