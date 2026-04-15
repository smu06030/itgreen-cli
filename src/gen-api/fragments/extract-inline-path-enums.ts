/**
 * swagger-typescript-api의 extractEnum 버그 회피:
 * inline path parameter enum을 components/schemas로 추출하고 $ref로 교체한다.
 *
 * swagger-typescript-api가 inline path enum + extractEnums: true 조합에서
 * 컴포넌트 래퍼 객체를 parseSchema에 넘기는 버그가 있어 무한 루프가 발생한다.
 * $ref로 변환하면 이 코드 경로를 타지 않는다.
 */

interface PathParam {
  in: string;
  name: string;
  schema?: Record<string, unknown>;
}

interface SwaggerSchema {
  paths?: Record<string, Record<string, { parameters?: PathParam[] }>>;
  components?: { schemas?: Record<string, unknown> };
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function extractInlinePathEnums(schema: unknown): void {
  const s = schema as SwaggerSchema;
  if (!s?.paths || !s?.components?.schemas) return;

  for (const methods of Object.values(s.paths)) {
    for (const operation of Object.values(methods)) {
      const params = operation?.parameters;
      if (!Array.isArray(params)) continue;

      for (const param of params) {
        if (
          param.in === "path" &&
          param.schema &&
          Array.isArray(param.schema.enum) &&
          !param.schema.$ref
        ) {
          const schemaName = `${toPascalCase(param.name)}Param`;

          if (!s.components.schemas[schemaName]) {
            s.components.schemas[schemaName] = { ...param.schema };
          }

          param.schema = { $ref: `#/components/schemas/${schemaName}` };
        }
      }
    }
  }
}
