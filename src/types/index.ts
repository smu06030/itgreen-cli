export interface ConvertWebpOptions {
  quality?: number;
  recursive?: boolean;
}

export interface ConvertResult {
  success: string[];
  failed: string[];
}

export * from "./config.js";
