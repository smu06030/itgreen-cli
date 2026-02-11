# ITGreen CLI

> Next.js 개발을 위한 다목적 CLI 도구

[![npm version](https://img.shields.io/npm/v/@smu06030/itgreen-cli.svg)](https://www.npmjs.com/package/@smu06030/itgreen-cli)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/smu06030/itgreen-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ 주요 기능

- 🖼️ **이미지 변환**: PNG/JPG를 WebP로 일괄 변환.
- 📁 **이미지 상수 생성**: 디렉토리의 이미지 파일을 TypeScript 상수로 자동 생성.
- 🛣️ **라우트 상수 생성**: Next.js Page Router와 App Router의 경로를 TypeScript 상수로 자동 생성.
- 🔌 **API 코드 생성**: Swagger/OpenAPI 스키마에서 TypeScript API 클라이언트 및 React Query 훅 자동 생성.
- ⚙️ **설정 관리**: `itgreen.config.js`를 통한 프로젝트별 설정.

## 📦 설치

```bash
npm install -g @smu06030/itgreen-cli
```

또는 프로젝트별 설치:

```bash
npm install --save-dev @smu06030/itgreen-cli
```

## 🚀 빠른 시작

### 1. 설정 파일 생성

```bash
itgreen init
```

### 2. 이미지를 WebP로 변환

```bash
itgreen convert:webp
```

### 3. 이미지 경로 상수 생성

```bash
itgreen gen:img
```

### 4. 라우트 경로 상수 생성

```bash
itgreen gen:route
```

### 5. Swagger API 코드 생성

```bash
itgreen gen:api
```

## 📋 명령어

### `init`

설정 파일 `itgreen.config.js`를 생성합니다.

```bash
itgreen init
```

### `convert:webp`

PNG/JPG 파일을 WebP 형식으로 변환합니다.

```bash
itgreen convert:webp
```

**설정 예시** (`itgreen.config.js`):

```js
export default {
  webp: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "public/images",
    /** 변환된 WebP 파일이 생성될 경로입니다. */
    outputPath: "public/webp",
    /** 변환되는 이미지의 품질을 결정합니다. (1~100) */
    quality: 80,
    /** 변환할 이미지 파일을 판별하는 glob 패턴입니다. */
    includePatterns: ["**/*.{png,jpg,jpeg}"],
    /** 제외할 이미지 파일을 판별하는 glob 패턴입니다. */
    excludePatterns: ["**/node_modules/**"],
  },
};
```

### `gen:img`

디렉토리의 이미지 파일을 스캔하여 TypeScript 경로 상수를 생성합니다.

```bash
itgreen gen:img
```

**설정 예시**:

```js
export default {
  genImg: {
    /** 조회할 이미지 파일들이 포함되어있는 폴더입니다. */
    inputPath: "public/images",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/images.ts",
    /** 생성될 이미지 객체의 이름입니다. */
    displayName: "IMAGES",
    /** 생성될 객체의 value에 할당될 경로의 base-path입니다. */
    basePath: "/",
    /** 포함할 이미지 파일을 판별하는 패턴입니다. */
    includingPattern: ["*.jpg", "*.png", "*.svg", "*.webp"],
    /** 제외할 이미지 파일을 판별하는 패턴입니다. */
    ignoredPattern: ["**/node_modules/**"],
  },
};
```

**생성되는 파일**:

```typescript
export const IMAGES = {
  LOGO: { src: "/logo.png", alt: "logo" },
  BANNER: { src: "/banner.jpg", alt: "banner" },
} as const;
```

### `gen:route`

Next.js 페이지 파일을 스캔하여 라우트 경로 상수를 생성합니다. Page Router와 App Router 모두 지원합니다.

```bash
itgreen gen:route
```

**설정 예시 (Page Router)**:

```js
export default {
  genRoute: {
    /** 조회할 page 파일들이 포함되어있는 폴더입니다. */
    inputPath: "src/pages",
    /** 생성될 파일이 위치할 경로입니다. */
    outputPath: "src/generated/path/routes.ts",
    /** 생성될 route 객체의 이름입니다. */
    displayName: "ROUTES",
    /** 제외될 route 파일의 glob 패턴입니다. */
    ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
    /** 포함할 route 파일의 glob 패턴입니다. */
    includingPattern: ["*.tsx", "*.ts"],
  },
};
```

**설정 예시 (App Router)**:

```js
export default {
  genRoute: {
    inputPath: "src/app",
    outputPath: "src/generated/path/routes.ts",
    displayName: "ROUTES",
    ignoredPattern: ["layout.tsx", "loading.tsx", "error.tsx"],
    includingPattern: ["**/page.tsx"],
  },
};
```

**생성되는 파일**:

```typescript
export const ROUTES = {
  MAIN: "/",
  ABOUT: "/about",
  BLOG: "/blog",
  BLOG_BY_ID: "/blog/[id]",
  USER_BY_USER_ID_PROFILE: "/user/[userId]/profile",
} as const;
```

**사용 예시**:

```typescript
import { ROUTES } from "@/generated/path/routes";

// 타입 안전한 라우팅
router.push(ROUTES.BLOG);
router.push(ROUTES.BLOG_BY_ID.replace("[id]", "123"));
```

### `gen:api`

Swagger/OpenAPI 스키마에서 TypeScript API 클라이언트 코드와 React Query 훅을 자동 생성합니다.

```bash
itgreen gen:api
```

**설정 예시**:

```js
export default {
  genApi: {
    /** Swagger/OpenAPI 스키마의 URL 또는 로컬 파일(yaml, json) 경로입니다. */
    swaggerSchemaUrl: "https://api.example.com/v3/api-docs",
    /** 생성될 API 파일들이 위치할 경로입니다. */
    outputPath: "src/generated/apis",
    /** React Query 훅 생성 여부입니다. */
    includeReactQuery: true,
    /** React Infinite Query 훅 생성 여부입니다. */
    includeReactInfiniteQuery: true,
    /** axios 인스턴스의 import 경로입니다. */
    axiosInstancePath: "@apis/_axios/instance",
    /** Infinite Query의 페이지네이션 설정입니다. */
    paginations: [{ keywords: ["cursor"], nextKey: "cursor" }],
  },
};
```

**생성되는 파일 구조**:

```
src/generated/apis/
├── @types/           # 타입 정의 파일
├── @utils/           # 유틸리티 타입
├── @http-client/     # HTTP 클라이언트 설정
└── <module>/         # API 모듈별 디렉토리
    ├── <module>.api.ts    # API 함수
    └── <module>.query.ts  # React Query 훅
```

## 📄 라이센스

MIT © [smu06030](https://github.com/smu06030)

## 🔗 링크

- [GitHub 저장소](https://github.com/smu06030/itgreen-cli)
- [npm 패키지](https://www.npmjs.com/package/@smu06030/itgreen-cli)
- [이슈 제보](https://github.com/smu06030/itgreen-cli/issues)
