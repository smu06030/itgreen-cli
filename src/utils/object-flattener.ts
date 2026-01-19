export interface FlattenOptions {
  formatKey: (parent: string, child: string) => string;
  isValueType: (value: any) => boolean;
}

/**
 * 중첩된 객체 구조를 단일 레벨 객체로 평탄화
 */
export function flatObject(
  obj: Record<string, any>,
  options: FlattenOptions,
): Record<string, any> {
  const result: Record<string, any> = {};

  const flatten = (current: Record<string, any>, parentKey: string = "") => {
    for (const [key, value] of Object.entries(current)) {
      const newKey = options.formatKey(parentKey, key);

      if (options.isValueType(value)) {
        // 리프 값이므로 결과에 추가
        result[newKey] = value;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // 중첩 객체이므로 재귀 호출
        flatten(value, newKey);
      }
    }
  };

  flatten(obj);
  return result;
}
