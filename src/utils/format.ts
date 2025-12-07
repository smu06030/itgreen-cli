/**
 * Converts a string to SNAKE_UPPER_CASE format
 * Example: "myImageFile" -> "MY_IMAGE_FILE"
 */
export function toSnakeUpperCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1") // Add underscore before capitals
    .replace(/[- ]/g, "_") // Replace spaces and hyphens with underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_/, "") // Remove leading underscore
    .toUpperCase();
}

/**
 * Removes empty objects from a nested object structure
 */
export function removeEmptyObject<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      const cleaned = removeEmptyObject(value);
      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
