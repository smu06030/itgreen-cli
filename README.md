# @smu06030/itgreen-cli

[![npm version](https://img.shields.io/npm/v/@smu06030/itgreen-cli.svg)](https://www.npmjs.com/package/@smu06030/itgreen-cli)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/smu06030/itgreen-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A versatile CLI tool for ITGreen development tasks - streamline your development workflow with powerful automation tools.

## 🌟 Features

- ✅ **WebP Image Conversion**: Convert PNG/JPG images to WebP format with custom quality settings
- ✅ **Image Path Generator**: Automatically generate TypeScript constants from image directories
- ✅ **Config-based Workflow**: Initialize and manage settings via `.itgreenrc.json`
- ✅ **Glob Pattern Support**: Include/exclude files using flexible glob patterns
- ✅ **Dual Module Support**: ESM and CommonJS compatibility
- ✅ **TypeScript**: Fully typed for better developer experience

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @smu06030/itgreen-cli
```

### As a Dev Dependency

```bash
npm install --save-dev @smu06030/itgreen-cli
```

### Using npx (No Installation Required)

```bash
npx @smu06030/itgreen-cli init
npx @smu06030/itgreen-cli convert:webp
npx @smu06030/itgreen-cli gen:img
```

## 🚀 Quick Start

### 1. Initialize Configuration

```bash
itgreen init
```

This creates a `.itgreenrc.json` file in your project root:

```json
{
  "webp": {
    "inputPath": "public/images",
    "outputPath": "public/webp",
    "quality": 80,
    "includePatterns": ["*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}"],
    "excludePatterns": ["**/node_modules/**"]
  }
}
```

### 2. Customize Settings (Optional)

Edit `.itgreenrc.json` to match your project structure:

```json
{
  "webp": {
    "inputPath": "src/assets/images",
    "outputPath": "src/assets/webp",
    "quality": 90,
    "includePatterns": ["**/*.{png,jpg,jpeg}"],
    "excludePatterns": ["**/node_modules/**", "**/drafts/**", "**/*.webp"]
  }
}
```

### 3. Convert Images to WebP

```bash
itgreen convert:webp
```

## 📖 Commands

### `itgreen init`

Initialize a new configuration file (`.itgreenrc.json`) in the current directory.

```bash
itgreen init
```

### `itgreen convert:webp`

Convert images to WebP format based on your configuration.

```bash
itgreen convert:webp
```

**Configuration Options:**

| Option            | Type       | Required | Default                     | Description                           |
| ----------------- | ---------- | -------- | --------------------------- | ------------------------------------- |
| `inputPath`       | `string`   | ✅       | -                           | Source directory containing images    |
| `outputPath`      | `string`   | ❌       | `inputPath`                 | Destination directory for WebP images |
| `quality`         | `number`   | ❌       | `80`                        | Conversion quality (1-100)            |
| `includePatterns` | `string[]` | ❌       | `["*.{png,jpg,jpeg,webp}"]` | Glob patterns for files to include    |
| `excludePatterns` | `string[]` | ❌       | `["**/node_modules/**"]`    | Glob patterns for files to exclude    |

### `itgreen gen:img`

Generate TypeScript image path constants from a directory structure for type-safe image references.

```bash
itgreen gen:img
```

**Configuration Options:**

Add a `genImg` section to your `.itgreenrc.json`:

```json
{
  "genImg": {
    "inputPath": "public",
    "outputPath": "src/generated/images.ts",
    "displayName": "IMAGES",
    "basePath": "/",
    "includingPattern": ["*.jpg", "*.png", "*.svg", "*.jpeg", "*.webp"],
    "ignoredPattern": ["*node_module*"]
  }
}
```

| Option             | Type       | Required | Default                                       | Description                               |
| ------------------ | ---------- | -------- | --------------------------------------------- | ----------------------------------------- |
| `inputPath`        | `string`   | ❌       | `"public"`                                    | Directory to scan for images              |
| `outputPath`       | `string`   | ❌       | `"src/generated/images.ts"`                   | Output file path for generated TypeScript |
| `displayName`      | `string`   | ❌       | `"IMAGES"`                                    | Name of the exported constant             |
| `basePath`         | `string`   | ❌       | `"/"`                                         | Base path prepended to image URLs         |
| `includingPattern` | `string[]` | ❌       | `["*.jpg","*.png","*.svg","*.jpeg","*.webp"]` | Glob patterns for image files to include  |
| `ignoredPattern`   | `string[]` | ❌       | `["*node_module*"]`                           | Glob patterns for directories to exclude  |

**Example Output:**

Given this directory structure:

```
public/
  └── images/
      ├── logo.png
      └── icons/
          └── search.svg
```

Running `itgreen gen:img` generates:

```typescript
export const IMAGES = {
  IMAGES_LOGO: {
    src: "/images/logo.png",
    alt: "logo",
  },
  IMAGES_ICONS_SEARCH: {
    src: "/images/icons/search.svg",
    alt: "icons-search",
  },
} as const;
```

**Usage in Your Code:**

```typescript
import { IMAGES } from "@/generated/images";

function Logo() {
  return <img src={IMAGES.IMAGES_LOGO.src} alt={IMAGES.IMAGES_LOGO.alt} />;
}
```

**Benefits:**

- ✅ Type-safe image paths with autocomplete
- ✅ Compile-time error checking for missing images
- ✅ Automatic alt text generation
- ✅ Refactoring support - rename/move images safely

## 🛠️ Development

### Setup

```bash
git clone https://github.com/smu06030/itgreen-cli.git
cd itgreen-cli
npm install
```

### Development Mode

```bash
# Run commands in dev mode
npm run dev init
npm run dev convert:webp
```

### Build

```bash
npm run build
```

Generates:

- `dist/index.js` - ES Module build
- `dist/index.cjs` - CommonJS build

### Type Check

```bash
npm run typecheck
```

### Link Locally

```bash
npm link
```

Now you can use `itgreen` command anywhere on your system during development.

## 🏗️ Architecture

### Tech Stack

- **Language**: TypeScript 5.7+
- **CLI Framework**: Commander.js
- **Build Tool**: tsup
- **Runtime**: Node.js 18+
- **Module Format**: Dual ESM/CJS support
- **CI/CD**: Semantic Release + GitHub Actions

### Key Dependencies

- `commander` - CLI framework
- `webp-converter` - Image conversion engine
- `chalk` - Terminal colors
- `ora` - Progress spinners
- `glob` - File pattern matching
- `eta` - Template engine for code generation
- `prettier` - Code formatting
- `minimatch` - Glob pattern matching

### Build Configuration

The project uses `tsup` for building with the following setup:

- Dual format output (ESM + CJS)
- Shebang preservation for CLI
- No minification for better debugging
- Clean build directory on each build

## 📝 Release Process

This project uses [Semantic Release](https://semantic-release.gitbook.io/) for automated versioning and publishing:

1. Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
2. On push to `main`, GitHub Actions:
   - Analyzes commits
   - Generates changelog
   - Creates GitHub release
   - Publishes to npm
   - Updates version in package.json

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
chore: maintenance tasks
```

## 🗺️ Roadmap

Future commands planned:

- `gen:api` - Generate API functions/types/React Query hooks from Swagger
- `gen:icon` - Generate Chakra UI Icon components from SVG files
- `gen:font` - Generate Next.js Local Font configurations
- `gen:route` - Generate route path objects from Pages directory
- `gen:source` - Generate Page/API templates

## 📄 License

MIT © [smu06030](https://github.com/smu06030)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/smu06030/itgreen-cli/issues).

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@smu06030/itgreen-cli)
- [GitHub Repository](https://github.com/smu06030/itgreen-cli)
- [Changelog](./CHANGELOG.md)
