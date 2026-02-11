---
description: Architecture and code organization standards for itgreen-cli
globs: src/**/*
alwaysApply: true
---

# itgreen-CLI Architecture Guide

This document defines the architectural patterns, code organization standards, and development guidelines for the `itgreen-cli` project.

## Project Overview

`itgreen-cli` is a TypeScript-based CLI tool designed to enhance development productivity for the IT Green project. It provides utilities for image conversion, code generation, and other automation tasks.

**Key Characteristics:**

- **Language**: TypeScript (strict mode)
- **Module System**: ESM (ES Modules)
- **Runtime**: Node.js 18+
- **CLI Framework**: Commander.js
- **Build Tool**: tsup
- **Template Engine**: Eta (for code generation)
- **Code Formatting**: Prettier

---

## Directory Structure

```
itgreen-cli/
├── src/
│   ├── index.ts              # CLI entry point & initialization
│   ├── commands/             # Command implementations
│   │   ├── index.ts          # Command registration hub
│   │   ├── init/             # Configuration initialization
│   │   │   └── index.ts      # init command
│   │   ├── convert/          # Image conversion commands
│   │   │   ├── index.ts      # Convert command registration
│   │   │   └── webp.ts       # WebP conversion logic
│   │   └── gen/              # Code generation commands
│   │       ├── index.ts      # Gen command registration
│   │       └── generate-image-obj.ts  # Image path generation
│   ├── utils/                # Shared utility modules
│   │   ├── logger.ts         # Logging utilities
│   │   ├── file.ts           # File system utilities
│   │   ├── config.ts         # Configuration management
│   │   ├── format.ts         # String formatting (SNAKE_UPPER_CASE)
│   │   ├── file-scanner.ts   # Recursive file scanning with glob
│   │   └── object-flattener.ts  # Object flattening utilities
│   ├── types/                # Type definitions
│   │   ├── index.ts          # Core type re-exports
│   │   ├── config.ts         # Configuration types
│   │   ├── gen-img.ts        # gen:img specific types
│   │   └── webp-converter.d.ts  # External library declarations
│   └── templates/            # Code generation templates
│       └── image-template.eta  # Eta template for gen:img
├── .agent/                   # Agent configuration
│   └── rules/                # Project development rules
├── dist/                     # Build output (generated)
├── test-images/              # Test assets
├── test-output/              # Generated test files
├── package.json              # Project metadata & dependencies
├── tsconfig.json             # TypeScript configuration
├── tsup.config.ts            # Build configuration
├── itgreen.config.js           # CLI configuration file
└── README.md                 # Project documentation
```

---

## Current Implemented Commands

### 1. init - Configuration Initialization

- **Purpose**: Create itgreen.config.js configuration file
- **Location**: src/commands/init/index.ts
- **Config Management**: Uses utils/config.ts

### 2. convert:webp - WebP Image Conversion

- **Purpose**: Convert PNG/JPG images to WebP format
- **Location**: src/commands/convert/webp.ts
- **Dependencies**: webp-converter, glob
- **Configuration**: Reads from itgreen.config.js → webp section

### 3. gen:img - TypeScript Image Path Generator

- **Purpose**: Generate type-safe TypeScript constants from image directory structure
- **Location**: src/commands/gen/generate-image-obj.ts
- **Flow**:
  1. 설정 병합 (getImageConfig)
  2. 파일 스캔 (file-scanner.ts - recursive glob)
  3. 객체 평탄화 (object-flattener.ts)
  4. Eta 템플릿 렌더링
  5. Prettier 포맷팅
  6. 파일 작성

- **Key Utilities**:
  - utils/file-scanner.ts: Recursive directory scanning with glob pattern matching
  - utils/object-flattener.ts: Nested object → flat object conversion
  - utils/format.ts: String formatting (SNAKE_UPPER_CASE)

- **Configuration**: Reads from itgreen.config.js → genImg section

---

## Best Practices Summary

### Code Quality

- ✅ 모든 주석은 한국어로 작성
- ✅ Clean Code 가이드라인 준수
- ✅ TypeScript strict mode 사용
- ✅ Public API는 명시적 타입 사용
- ✅ 함수는 20줄 이하로 유지
- ✅ Single Responsibility Principle

### Module Organization

- ✅ 기능 기반 조직화
- ✅ 명확한 관심사 분리
- ✅ Import시 명시적 파일 확장자 사용 (.js)
- ✅ 관련 파일 공동 배치

### Configuration

- ✅ itgreen.config.js을 통한 중앙화된 설정 관리
- ✅ 각 명령어는 자체 설정 섹션 보유
- ✅ 기본값 제공으로 사용자 편의성 향상
