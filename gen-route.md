# gen:route 기능 가이드

Next.js 프로젝트에서 페이지 파일들을 스캔하여 라우트 경로 상수 객체를 자동으로 생성하는 기능입니다.

## 목차

1. [개요](#개요)
2. [동작 방식](#동작-방식)
3. [설정](#설정)
4. [구현 상세](#구현-상세)
5. [App Router와 Page Router 지원](#app-router와-page-router-지원)
6. [사용 예시](#사용-예시)

---

## 개요

`gen:route` 명령어는 Next.js 프로젝트의 페이지 디렉토리를 재귀적으로 스캔하여, 각 페이지 파일의 경로를 담은 타입스크립트 객체를 자동 생성합니다.

### 주요 기능

- **자동 라우트 탐색**: 페이지 디렉토리를 재귀적으로 스캔
- **타입 안전성**: TypeScript 객체로 라우트 상수 생성
- **커스터마이징**: glob 패턴으로 포함/제외 파일 설정
- **동적 라우트 지원**: `[id]`, `[slug]` 등 동적 라우트 자동 처리
- **중첩 구조 지원**: 중첩된 폴더 구조를 객체로 표현

---

## 동작 방식

### 1. 기본 워크플로우

```mermaid
graph LR
    A[페이지 디렉토리 스캔] --> B[파일 필터링]
    B --> C[중첩 객체 생성]
    C --> D[Flat 객체 변환]
    D --> E[템플릿 렌더링]
    E --> F[파일 생성]
```

### 2. 처리 과정

1. **디렉토리 스캔**: `inputPath`에 지정된 폴더를 재귀적으로 탐색
2. **파일 필터링**: `ignoredPattern`과 `includingPattern`을 사용하여 필터링
3. **객체 변환**: 파일 경로를 중첩된 객체 구조로 변환
4. **키 포맷팅**: 파일명을 `SNAKE_UPPER_CASE` 형식의 키로 변환
5. **Flat 객체 생성**: 중첩된 객체를 flat한 구조로 변환
6. **코드 생성**: ETA 템플릿을 사용하여 TypeScript 코드 생성
7. **Prettier 적용**: 생성된 코드에 Prettier 포맷팅 적용
8. **파일 저장**: `outputPath`에 최종 파일 저장

---

## 설정

### TypeScript 타입 정의

```typescript
export type GenerateRouteConfig = {
  /** 조회할 page 파일들이 포함되어있는 폴더 입니다. */
  inputPath: string;
  /** 생성될 파일이 위치할 경로입니다. */
  outputPath: string;
  /** 생성될 route 객체의 이름입니다 */
  displayName: string;
  /** 포함할 route 의 glob 패턴입니다. */
  includingPattern: string[];
  /** 제외될 route 의 glob 패턴입니다. */
  ignoredPattern: string[];
};
```

### 기본 설정값

```javascript
const routeDefaultConfig = {
  inputPath: "src/pages",
  outputPath: "src/generated/path/routes.ts",
  displayName: "ROUTES",
  ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
  includingPattern: [],
};
```

### 설정 파일 예시

프로젝트 루트에 `tokript.config.js` 파일 생성:

```javascript
// tokript.config.js
module.exports = {
  "gen:route": {
    /** 조회할 page 파일들이 포함되어있는 폴더 */
    inputPath: "src/pages",
    /** 생성될 파일이 위치할 경로 */
    outputPath: "src/generated/path/routes.ts",
    /** 생성될 route 객체의 이름 */
    displayName: "ROUTES",
    /** 포함할 route 의 glob 패턴 */
    includingPattern: [],
    /** 제외될 route 의 glob 패턴 */
    ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
  },
};
```

---

## 구현 상세

### 1. 핵심 의존성

```javascript
import * as eta from "eta";
import fs from "fs";
import path from "path";
import util from "util";
```

### 2. 핵심 로직

#### 파일 경로를 객체로 변환

```javascript
// convertFilePathToObject 함수 사용
const routeObject = convertFilePathToObject(inputPath, {
  ignoredPattern,
  includingPattern,
  basePath: "/",
  formatKey: (fileName, utils) => {
    // index.tsx -> 'MAIN'
    if (fileName === "index") return "MAIN";

    // [id].tsx -> 'BY_ID'
    const [match] = Array.from(fileName.matchAll(/\[(.*?)\]/g));
    if (match?.[1]) {
      return utils.toUpperSnakeCase(`by ${match[1]}`);
    }

    // about.tsx -> 'ABOUT'
    return utils.toUpperSnakeCase(fileName);
  },
  formatValue: (info) => {
    // 파일 확장자 제거 및 index 처리
    const route = info.path.replace(/\.(tsx|ts)$/, "").replace(/index/, "");

    // 마지막 슬래시 제거
    if (route.endsWith("/")) {
      return route.substring(0, route.length - 1) || "/";
    }

    return route;
  },
});
```

#### Flat 객체 생성

```javascript
// flatObject 함수로 중첩 구조를 flat하게 변환
const flatRoutes = flatObject(routeObject, {
  formatKey: (parent, child) => {
    // 'MAIN'을 제거하고 부모와 자식을 결합
    const combined = [parent, child].join(" ").replaceAll("MAIN", "");

    return getTextCase(combined).snakeUpperCase;
  },
});
```

#### 템플릿 렌더링

```javascript
// ETA 템플릿 사용
const template = await eta.renderFile("templates/route/route-template.eta", {
  routeObject: util.inspect(flatRoutes, { depth: Infinity }),
  displayName: "ROUTES",
});
```

**템플릿 파일 (`route-template.eta`)**:

```typescript
export const <%~ it.displayName %> = <%~ it.routeObject %>
```

#### 파일 생성

```javascript
// 디렉토리 생성 (재귀적)
fs.mkdirSync(path.parse(outputPath).dir, { recursive: true });

// Prettier 적용 후 파일 저장
const formattedCode = await prettierString(template);
fs.writeFileSync(outputPath, formattedCode, "utf-8");
```

### 3. 유틸리티 함수들

#### `convertFilePathToObject`

파일 시스템을 재귀적으로 탐색하여 중첩된 객체 구조를 생성합니다.

**옵션**:

- `includingPattern`: 포함할 파일의 glob 패턴 배열
- `ignoredPattern`: 제외할 파일의 glob 패턴 배열
- `recursive`: 재귀적으로 탐색할지 여부 (기본: `true`)
- `basePath`: 생성될 경로의 기본 경로
- `formatKey`: 키 이름을 포맷하는 함수
- `formatValue`: 값(경로)을 포맷하는 함수

#### `flatObject`

중첩된 객체를 flat한 구조로 변환합니다.

**옵션**:

- `formatKey`: 부모와 자식 키를 결합하는 함수
- `isValueType`: 값 타입인지 확인하는 함수

#### `checkFileAccess`

glob 패턴을 사용하여 파일을 포함/제외할지 결정합니다.

---

## App Router와 Page Router 지원

### Page Router (기본 설정)

**디렉토리 구조**:

```
src/pages/
├── index.tsx           → ROUTES.MAIN = '/'
├── about.tsx           → ROUTES.ABOUT = '/about'
├── blog/
│   ├── index.tsx       → ROUTES.BLOG = '/blog'
│   └── [id].tsx        → ROUTES.BLOG_BY_ID = '/blog/[id]'
└── user/
    └── [userId]/
        └── profile.tsx → ROUTES.USER_BY_USER_ID_PROFILE = '/user/[userId]/profile'
```

**설정**:

```javascript
// tokript.config.js
module.exports = {
  "gen:route": {
    inputPath: "src/pages",
    outputPath: "src/generated/path/routes.ts",
    displayName: "ROUTES",
    ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
  },
};
```

### App Router 지원

**디렉토리 구조**:

```
src/app/
├── page.tsx                    → ROUTES.MAIN = '/'
├── about/
│   └── page.tsx                → ROUTES.ABOUT = '/about'
├── blog/
│   ├── page.tsx                → ROUTES.BLOG = '/blog'
│   └── [id]/
│       └── page.tsx            → ROUTES.BLOG_BY_ID = '/blog/[id]'
└── dashboard/
    ├── layout.tsx              (제외됨)
    ├── loading.tsx             (제외됨)
    └── settings/
        └── page.tsx            → ROUTES.DASHBOARD_SETTINGS = '/dashboard/settings'
```

**설정**:

```javascript
// tokript.config.js
module.exports = {
  "gen:route": {
    inputPath: "src/app",
    outputPath: "src/generated/path/routes.ts",
    displayName: "ROUTES",
    // App Router 전용 제외 패턴
    ignoredPattern: [
      "layout.tsx",
      "loading.tsx",
      "error.tsx",
      "not-found.tsx",
      "template.tsx",
      "api/**",
      "**/route.ts", // API Routes 제외
    ],
    // page.tsx만 포함
    includingPattern: ["**/page.tsx"],
  },
};
```

### 통합 설정 (모노레포)

여러 Next.js 앱을 운영하는 경우:

```javascript
// tokript.config.js
module.exports = {
  // Page Router 앱
  "gen:route": {
    inputPath: "apps/web-legacy/src/pages",
    outputPath: "apps/web-legacy/src/generated/routes.ts",
    displayName: "ROUTES",
    ignoredPattern: ["_app.tsx", "_document.tsx", "_error.tsx", "api/**"],
  },

  // App Router 앱 (별도 스크립트로 실행)
  // package.json에 "gen:route:app": "tokript gen:route --config tokript.app.config.js" 추가
};
```

---

## 사용 예시

### 1. CLI 실행

```bash
# 패키지 설치
npm install -D tokript
# 또는
yarn add -D tokript

# 명령어 실행
npx tokript gen:route
# 또는
yarn tokript gen:route
```

### 2. package.json 스크립트

```json
{
  "scripts": {
    "gen:route": "tokript gen:route",
    "gen:route:watch": "nodemon --watch 'src/pages/**/*' --exec 'tokript gen:route'"
  }
}
```

### 3. 생성된 파일 예시

**입력 (디렉토리 구조)**:

```
src/pages/
├── index.tsx
├── about.tsx
├── blog/
│   ├── index.tsx
│   └── [id].tsx
└── user/
    └── [userId]/
        └── profile.tsx
```

**출력 (`src/generated/path/routes.ts`)**:

```typescript
export const ROUTES = {
  MAIN: "/",
  ABOUT: "/about",
  BLOG: "/blog",
  BLOG_BY_ID: "/blog/[id]",
  USER_BY_USER_ID_PROFILE: "/user/[userId]/profile",
};
```

### 4. 코드에서 사용

```typescript
import { ROUTES } from '@/generated/path/routes';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();

  return (
    <nav>
      <a href={ROUTES.MAIN}>Home</a>
      <a href={ROUTES.ABOUT}>About</a>
      <a href={ROUTES.BLOG}>Blog</a>
      <button onClick={() => router.push(ROUTES.BLOG_BY_ID.replace('[id]', '123'))}>
        Go to Blog Post
      </button>
    </nav>
  );
}
```

### 5. 동적 라우트 헬퍼 함수

```typescript
import { ROUTES } from "@/generated/path/routes";

// 동적 라우트 헬퍼 함수
export const createRoute = {
  blogPost: (id: string) => ROUTES.BLOG_BY_ID.replace("[id]", id),
  userProfile: (userId: string) =>
    ROUTES.USER_BY_USER_ID_PROFILE.replace("[userId]", userId),
};

// 사용 예시
router.push(createRoute.blogPost("my-first-post"));
router.push(createRoute.userProfile("user-123"));
```

---

## 필요한 유틸리티 함수

다음 유틸리티 함수들이 필요합니다:

### 1. `convertFilePathToObject`

```typescript
type FormatKeyFn<T> = (
  fileName: string,
  utils: { toUpperSnakeCase: (str: string) => string },
) => string;

type FormatValueFn<T> = (info: {
  key: string;
  path: string;
  wholePath: string;
  info: path.ParsedPath;
}) => T;

type Options<T> = {
  includingPattern?: string[];
  ignoredPattern?: string[];
  recursive?: boolean;
  basePath?: string;
  formatKey?: FormatKeyFn<T>;
  formatValue?: FormatValueFn<T>;
};

function convertFilePathToObject<T>(
  targetPath: string,
  options?: Options<T>,
): PathObj<T>;
```

### 2. `flatObject`

```typescript
type FlatOptions = {
  formatKey?: (parent: string, child: string) => string;
  isValueType?: (value: any) => boolean;
};

function flatObject(
  obj: Record<string, any>,
  options?: FlatOptions,
): Record<string, any>;
```

### 3. `checkFileAccess`

```typescript
import { minimatch } from "minimatch";

function checkFileAccess(options: {
  filename: string;
  ignored: string[];
  include: string[];
}): boolean {
  const { filename, ignored, include } = options;

  // 제외 패턴 체크
  for (const pattern of ignored) {
    if (minimatch(filename, pattern)) {
      return false;
    }
  }

  // 포함 패턴이 있으면 체크
  if (include.length > 0) {
    let isIncluded = false;
    for (const pattern of include) {
      if (minimatch(filename, pattern)) {
        isIncluded = true;
        break;
      }
    }
    return isIncluded;
  }

  return true;
}
```

### 4. `getTextCase`

```typescript
function convertToSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .replace(/[\s-]+/g, "_")
    .replace(/^_/, "")
    .toLowerCase();
}

function getTextCase(str: string) {
  return {
    snakeUpperCase: convertToSnakeCase(str).toUpperCase(),
  };
}
```

### 5. `prettierString`

```typescript
import prettier from "prettier";

async function prettierString(code: string): Promise<string> {
  return prettier.format(code, {
    parser: "typescript",
    semi: true,
    singleQuote: true,
    trailingComma: "es5",
  });
}
```

---

## 패키지 의존성

```json
{
  "dependencies": {
    "eta": "^1.12.3",
    "minimatch": "^5.1.0",
    "prettier": "^2.6.2"
  },
  "devDependencies": {
    "@types/node": "^18.15.10"
  }
}
```

---

## 고급 사용법

### 1. 커스텀 키 포맷팅

```javascript
module.exports = {
  "gen:route": {
    // ... 기본 설정
    formatKey: (fileName, utils) => {
      // 커스텀 로직
      if (fileName.startsWith("_")) {
        return null; // 제외
      }
      return utils.toUpperSnakeCase(fileName);
    },
  },
};
```

### 2. 다중 출력 파일

```javascript
// 여러 개의 route 파일 생성
module.exports = {
  "gen:route:public": {
    inputPath: "src/pages/(public)",
    outputPath: "src/generated/routes/public.ts",
    displayName: "PUBLIC_ROUTES",
  },
  "gen:route:admin": {
    inputPath: "src/pages/(admin)",
    outputPath: "src/generated/routes/admin.ts",
    displayName: "ADMIN_ROUTES",
  },
};
```

### 3. Watch 모드

```javascript
// nodemon으로 파일 변경 감지
{
  "scripts": {
    "gen:route:watch": "nodemon --watch 'src/pages/**/*' --ext tsx,ts --exec 'tokript gen:route'"
  }
}
```

---

## 트러블슈팅

### 생성된 파일이 비어있음

- `includingPattern`과 `ignoredPattern` 확인
- 파일 경로가 올바른지 확인
- 파일 확장자가 `.tsx` 또는 `.ts`인지 확인

### 키 네이밍 충돌

- 중복된 파일명이 있는지 확인
- `formatKey` 함수로 커스텀 로직 추가

### TypeScript 에러

- 생성된 파일에 Prettier가 올바르게 적용되었는지 확인
- `tsconfig.json`에서 해당 경로가 포함되어 있는지 확인

---

## 라이선스

ISC

---

## 참고 자료

- [Next.js Pages Router](https://nextjs.org/docs/pages)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Minimatch Documentation](https://github.com/isaacs/minimatch)
- [ETA Template Engine](https://eta.js.org/)
