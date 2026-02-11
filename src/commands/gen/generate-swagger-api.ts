import { resolve } from "path";
import type { GenApiConfig } from "../../types/gen-api.js";
import { getSwaggerApiFile } from "../../gen-api/fragments/get-swagger-api-file.js";
import { writeSwaggerApiFile } from "../../gen-api/fragments/write-swagger-api-file.js";

const GEN_API_DEFAULT_CONFIG: GenApiConfig = {
  swaggerSchemaUrl: "",
  outputPath: "src/generated/apis",
  includeReactQuery: true,
  includeReactInfiniteQuery: true,
  axiosInstancePath: "@apis/_axios/instance",
  paginations: [{ keywords: ["cursor"], nextKey: "cursor" }],
};

export async function generateSwaggerApi(
  userConfig: Partial<GenApiConfig>,
): Promise<void> {
  const config: GenApiConfig = { ...GEN_API_DEFAULT_CONFIG, ...userConfig };

  if (!config.swaggerSchemaUrl) {
    throw new Error(
      "swaggerSchemaUrl is required. Set it in itgreen.config.js under genApi.",
    );
  }

  const isUrl =
    config.swaggerSchemaUrl.startsWith("http://") ||
    config.swaggerSchemaUrl.startsWith("https://");

  if (!isUrl) {
    config.swaggerSchemaUrl = resolve(process.cwd(), config.swaggerSchemaUrl);
  }

  const outputPath = resolve(process.cwd(), config.outputPath);

  const output = await getSwaggerApiFile(config);

  await writeSwaggerApiFile({ output, outputPath });
}
