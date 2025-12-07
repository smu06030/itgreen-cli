export interface FlattenOptions {
  formatKey: (parent: string, child: string) => string;
  isValueType: (value: any) => boolean;
}

/**
 * Flattens a nested object structure into a single-level object
 */
export function flatObject(
  obj: Record<string, any>,
  options: FlattenOptions
): Record<string, any> {
  const result: Record<string, any> = {};

  const flatten = (current: Record<string, any>, parentKey: string = "") => {
    for (const [key, value] of Object.entries(current)) {
      const newKey = options.formatKey(parentKey, key);

      if (options.isValueType(value)) {
        // This is a leaf value, add it to result
        result[newKey] = value;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // This is a nested object, recurse
        flatten(value, newKey);
      }
    }
  };

  flatten(obj);
  return result;
}
