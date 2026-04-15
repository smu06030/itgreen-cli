function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPascalCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getUglyEnumBase(name: string): string | null {
  const matched = name.match(/^(ObjectObject\d+)(?:[A-Z].*)?Type$/);
  return matched?.[1] ?? null;
}

function buildRenameMap(config: Record<string, unknown>): Map<string, string> {
  const renameMap = new Map<string, string>();
  const baseNameMap = new Map<string, string>();
  const routes = [
    ...((config.routes as Record<string, unknown> | undefined)?.outOfModule as
      | Record<string, unknown>[]
      | undefined
      | null
      | [] ?? []),
    ...((((config.routes as Record<string, unknown> | undefined)?.combined as
      | Record<string, unknown>[]
      | undefined
      | null
      | []) ?? [])
      .flatMap(
        (group) =>
          ((group as Record<string, unknown>).routes as
            | Record<string, unknown>[]
            | undefined
            | null
            | []) ?? [],
      )),
  ];

  for (const route of routes) {
    const routeName = toPascalCase(
      String((route.routeName as Record<string, unknown> | undefined)?.usage ?? ""),
    );
    const parameters =
      (((route.request as Record<string, unknown> | undefined)?.parameters as
        | Record<string, unknown>[]
        | undefined
        | null
        | []) ?? []);

    for (const parameter of parameters) {
      const uglyName = String(parameter.type ?? "");
      const baseName = getUglyEnumBase(uglyName);

      if (!routeName || !baseName) {
        continue;
      }

      const parameterName = toPascalCase(String(parameter.name ?? "")).replace(
        /Type$/,
        "",
      );

      if (!parameterName) {
        continue;
      }

      const prettyName = `${routeName}${parameterName}Type`;
      baseNameMap.set(baseName, prettyName);
      renameMap.set(uglyName, prettyName);
    }
  }

  const modelTypes =
    ((config.modelTypes as Record<string, unknown>[] | undefined | null | []) ??
      []);

  for (const modelType of modelTypes) {
    const uglyName = String(modelType.name ?? "");
    const baseName = getUglyEnumBase(uglyName);
    const prettyName = baseName ? baseNameMap.get(baseName) : null;

    if (prettyName) {
      renameMap.set(uglyName, prettyName);
    }
  }

  return renameMap;
}

function replaceText(value: string, renameMap: Map<string, string>): string {
  let nextValue = value;

  for (const [from, to] of renameMap) {
    nextValue = nextValue.replace(
      new RegExp(`\\b${escapeRegExp(from)}\\b`, "g"),
      to,
    );
  }

  return nextValue;
}

function renameDeep(
  value: unknown,
  renameMap: Map<string, string>,
  visited: WeakSet<object>,
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      renameDeep(item, renameMap, visited);
    }
    return;
  }

  if (!isRecord(value) || visited.has(value)) {
    return;
  }

  visited.add(value);

  for (const [key, nestedValue] of Object.entries(value)) {
    if (typeof nestedValue === "string") {
      value[key] = replaceText(nestedValue, renameMap);
      continue;
    }

    renameDeep(nestedValue, renameMap, visited);
  }
}

function dedupeModelTypes(config: Record<string, unknown>): void {
  const modelTypes =
    ((config.modelTypes as Record<string, unknown>[] | undefined | null | []) ??
      []);
  const nextModelTypes: Record<string, unknown>[] = [];
  const seenNames = new Set<string>();

  for (const modelType of modelTypes) {
    const name = String(modelType.name ?? "");

    if (!name || seenNames.has(name)) {
      continue;
    }

    seenNames.add(name);
    nextModelTypes.push(modelType);
  }

  config.modelTypes = nextModelTypes;
}

export function renameInlineRequestEnums(config: Record<string, unknown>): void {
  const renameMap = buildRenameMap(config);

  if (renameMap.size === 0) {
    return;
  }

  const visited = new WeakSet<object>();
  renameDeep(config.modelTypes, renameMap, visited);
  renameDeep(config.routes, renameMap, visited);
  dedupeModelTypes(config);
}
