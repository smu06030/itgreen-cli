import { QUERY_HOOK_INDICATOR } from "../gen-api.data.js";

function getLastImportLineIndex(content: string): number {
  const lines = content.split("\n");
  const importLineIndices = lines
    .map((line, idx) => ({ idx, has: /from ('|").*('|");/.test(line) }))
    .filter(({ has }) => has)
    .map(({ idx }) => idx);

  return importLineIndices.length > 0 ? Math.max(...importLineIndices) + 1 : 0;
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function splitHookContents(
  moduleName: string,
  content: string,
): { apiContents: string; hookContents: string } {
  const [apiContents, hookPart] = content.split(QUERY_HOOK_INDICATOR);
  const lastImportIdx = getLastImportLineIndex(content);
  const lines = content.split("\n");

  const importLines = lines.slice(0, lastImportIdx);
  const apiImport = `import { ${toCamelCase(moduleName)}Api } from './${moduleName}.api';`;

  const hookContents = [apiImport, ...importLines].join("\n") + hookPart;

  return { apiContents, hookContents };
}
