# ITGreen CLI

> Next.js 개발을 위한 다목적 CLI 도구

[![npm version](https://img.shields.io/npm/v/@smu06030/itgreen-cli.svg)](https://www.npmjs.com/package/@smu06030/itgreen-cli)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/smu06030/itgreen-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ 주요 기능

- 🖼️ **이미지 변환**: PNG/JPG를 WebP로 일괄 변환
- 📁 **이미지 상수 생성**: 디렉토리의 이미지 파일을 TypeScript 상수로 자동 생성
- 🛣️ **라우트 상수 생성**: Next.js Page Router와 App Router의 경로를 TypeScript 상수로 자동 생성
- ⚙️ **설정 관리**: `.itgreenrc.json`을 통한 프로젝트별 설정

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

## 📋 명령어

### `init`

설정 파일 `.itgreenrc.json`을 생성합니다.

```bash
itgreen init
```

### `convert:webp`

PNG/JPG 파일을 WebP 형식으로 변환합니다.

```bash
itgreen convert:webp
```

**설정 예시** (`.itgreenrc.json`):

```json
{
  "webp": {
    "inputPath": "public/images",
    "outputPath": "public/webp",
    "quality": 80,
    "includePatterns": ["*.{png,jpg,jpeg}"],
    "excludePatterns": ["**/node_modules/**"]
  }
}
```

### `gen:img`

디렉토리의 이미지 파일을 스캔하여 TypeScript 경로 상수를 생성합니다.

```bash
itgreen gen:img
```

**설정 예시**:

```json
{
  "genImg": {
    "inputPath": "public/images",
    "outputPath": "src/generated/path/images.ts",
    "displayName": "IMAGES",
    "basePath": "/",
    "includingPattern": ["*.jpg", "*.png", "*.svg", "*.webp"],
    "ignoredPattern": ["**/node_modules/**"]
  }
}
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

```json
{
  "genRoute": {
    "inputPath": "src/pages",
    "outputPath": "src/generated/path/routes.ts",
    "displayName": "ROUTES",
    "ignoredPattern": ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
    "includingPattern": ["*.tsx", "*.ts"]
  }
}
```

**설정 예시 (App Router)**:

```json
{
  "genRoute": {
    "inputPath": "src/app",
    "outputPath": "src/generated/path/routes.ts",
    "displayName": "ROUTES",
    "ignoredPattern": ["layout.tsx", "loading.tsx", "error.tsx"],
    "includingPattern": ["**/page.tsx"]
  }
}
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

## 📄 라이센스

MIT © [smu06030](https://github.com/smu06030)

## 🔗 링크

- [GitHub 저장소](https://github.com/smu06030/itgreen-cli)
- [npm 패키지](https://www.npmjs.com/package/@smu06030/itgreen-cli)
- [이슈 제보](https://github.com/smu06030/itgreen-cli/issues)
