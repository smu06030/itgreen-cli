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

  // x-enumNames가 이미 있고 길이가 맞으면 그대로 유지
  const enumNames = getEnumNames(node["x-enumNames"]);
  if (enumNames?.length === enumValues.length) {
    return enumNames;
  }

  // x-enum-varnames가 있으면 x-enumNames로 승격
  const enumVarNames = getEnumNames(node["x-enum-varnames"]);
  if (enumVarNames?.length === enumValues.length) {
    return enumVarNames;
  }

  // 메타데이터가 없으면 enum 값 자체를 x-enumNames로 사용
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

    const nestedValues = Object.values(value);

    const resolvedEnumNames = resolveEnumNames(value);
    if (resolvedEnumNames) {
      value["x-enumNames"] = resolvedEnumNames;
    }

    for (const nestedValue of nestedValues) {
      visit(nestedValue);
    }
  };

  visit(schema);

  return schema;
}
