import { resolve } from "path";
import { generateApi } from "swagger-typescript-api";
import type { GenApiConfig } from "../../types/gen-api.js";
import {
  CUSTOM_TEMPLATE_FOLDER,
  EXTRA_TEMPLATE_FOLDER,
  QUERY_HOOK_INDICATOR,
} from "../gen-api.data.js";

interface SwaggerApiOutput {
  files: { fileName: string; fileExtension: string; fileContent: string }[];
}

export async function getSwaggerApiFile(
  config: GenApiConfig,
): Promise<SwaggerApiOutput> {
  const isUrl =
    config.swaggerSchemaUrl.startsWith("http://") ||
    config.swaggerSchemaUrl.startsWith("https://");

  const apiConfig: Record<string, unknown> = {
    output: false,
    templates: CUSTOM_TEMPLATE_FOLDER,
    modular: true,
    moduleNameFirstTag: true,
    extractEnums: true,
    addReadonly: true,
    unwrapResponseData: true,
    httpClientType: "axios",
    typeSuffix: "Type",
    extraTemplates: [
      {
        name: "react-query-type.ts",
        path: resolve(EXTRA_TEMPLATE_FOLDER, "react-query-type.eta"),
      },
      {
        name: "util-types.ts",
        path: resolve(EXTRA_TEMPLATE_FOLDER, "util-types.eta"),
      },
      {
        name: "param-serializer-by.ts",
        path: resolve(EXTRA_TEMPLATE_FOLDER, "param-serializer-by.eta"),
      },
    ],
    hooks: {
      onPrepareConfig: (defaultConfig: Record<string, unknown>) => ({
        ...defaultConfig,
        myConfig: { QUERY_HOOK_INDICATOR, ...config },
      }),
    },
  };

  if (isUrl) {
    apiConfig.url = config.swaggerSchemaUrl;
  } else {
    apiConfig.input = resolve(process.cwd(), config.swaggerSchemaUrl);
  }

  return generateApi(apiConfig as any);
}
