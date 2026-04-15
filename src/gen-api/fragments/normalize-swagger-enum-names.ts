function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getEnumNames(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  return value.map((item) => String(item));
}

function resolveEnumNames(node: Record<string, unknown>): string[] | null {
  const enumValues = getEnumNames(node.enum);

  if (!enumValues) {
    return null;
  }

  const enumNames = getEnumNames(node["x-enumNames"]);
  if (enumNames?.length === enumValues.length) {
    return enumNames;
  }

  const enumVarNames = getEnumNames(node["x-enum-varnames"]);
  if (enumVarNames?.length === enumValues.length) {
    return enumVarNames;
  }

  return enumValues;
}

export function normalizeSwaggerEnumNames<T>(schema: T): T {
  const visited = new WeakSet<object>();

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    if (!isRecord(value) || visited.has(value)) {
      return;
    }

    visited.add(value);

    const resolvedEnumNames = resolveEnumNames(value);
    if (resolvedEnumNames) {
      value["x-enumNames"] = resolvedEnumNames;
    }

    for (const nestedValue of Object.values(value)) {
      visit(nestedValue);
    }
  };

  visit(schema);

  return schema;
}
