/** @type {import('@smu06030/itgreen-cli').ItgreenConfig} */
export default {
  // ============================================================
  // WebP 이미지 변환 설정 (convert:webp)
  // ============================================================
  webp: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "test-images/images",
    /** 변환된 WebP 파일이 생성될 경로입니다. */
    outputPath: "test-output/webp",
    /** 변환되는 이미지의 품질을 결정합니다. (1~100) */
    quality: 80,
    /** 변환할 이미지 파일을 판별하는 glob 패턴입니다. 패턴과 일치하는 파일만 변환됩니다. */
    includePatterns: ["**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}"],
    /** 제외할 이미지 파일을 판별하는 glob 패턴입니다. 패턴과 일치하는 파일은 변환에서 제외됩니다. */
    excludePatterns: ["**/node_modules/**"],
  },

  // ============================================================
  // 이미지 경로 상수 생성 설정 (gen:img)
  // ============================================================
  genImg: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "public/images",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/images.ts",
    /** 생성될 이미지 객체의 이름입니다. */
    displayName: "IMAGES",
    /** 생성될 객체의 value에 할당될 경로의 base-path입니다. */
    basePath: "/",
    /** 포함할 이미지 파일을 판별하는 패턴입니다. 파일이름이 패턴과 일치할 경우에만 포함됩니다. */
    includingPattern: ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
    /** 제외할 이미지 파일을 판별하는 패턴입니다. 파일이름이 패턴과 일치할 경우 제외됩니다. */
    ignoredPattern: ["**/node_modules/**"],
  },

  // ============================================================
  // 라우트 경로 상수 생성 설정 (gen:route)
  // ============================================================
  genRoute: {
    /** 조회할 page 파일들이 포함되어있는 폴더입니다. */
    inputPath: "src/pages",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/routes.ts",
    /** 생성될 route 객체의 이름입니다. */
    displayName: "ROUTES",
    /** 제외될 route 파일의 glob 패턴입니다. */
    ignoredPattern: [
      "layout.tsx",
      "loading.tsx",
      "error.tsx",
      "not-found.tsx",
      "template.tsx",
      "_document.tsx",
      "_app.tsx",
    ],
    /** 포함할 route 파일의 glob 패턴입니다. */
    includingPattern: ["**/*.tsx"],
  },

  // ============================================================
  // API 코드 자동 생성 설정 (gen:api)
  // ============================================================
  genApi: {
    /**
     * Swagger/OpenAPI 스키마의 URL 또는 로컬 파일(yaml, json) 경로입니다.
     * 통상적으로 백엔드 개발자에게 공유받은 swagger-url의 '/openapi.json' 경로에 해당합니다.
     */
    swaggerSchemaUrl: "http://tapi.returnit.co.kr/v3/api-docs/3.%EC%95%B1",
    /** 생성될 API 파일들이 위치할 경로입니다. */
    outputPath: "test-output/apis",
  },
};
