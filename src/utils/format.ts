/**
 * 문자열을 SNAKE_UPPER_CASE 형식으로 변환
 * 예시: "myImageFile" -> "MY_IMAGE_FILE"
 */
export function toSnakeUpperCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1") // 대문자 앞에 언더스코어 추가
    .replace(/[- ]/g, "_") // 공백과 하이픈을 언더스코어로 변경
    .replace(/_+/g, "_") // 연속된 언더스코어를 하나로 통합
    .replace(/^_/, "") // 맨 앞 언더스코어 제거
    .toUpperCase();
}

/**
 * 중첩된 객체 구조에서 빈 객체를 제거
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
