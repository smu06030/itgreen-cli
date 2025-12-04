# itgreen

A versatile CLI tool for ITGreen development tasks

## Overview

`itgreen` is an independent CLI tool designed to boost development productivity. Written in TypeScript, it provides various features like image conversion, code generation, and more.

## Installation

### Global Installation via NPM (after publishing)

```bash
npm install -g @itgreen/cli
```

### Local Development

```bash
git clone <repository-url>
cd itgreen-cli
npm install
npm link
```

## Usage

### 📸 Convert Images to WebP

Convert PNG, JPG files to WebP format using a config file.

#### Step 1: Initialize Config File

```bash
itgreen init
```

This creates a `.itgreenrc.json` file in your current directory with default settings:

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

#### Step 2: Customize Config (Optional)

Edit `.itgreenrc.json` to customize your conversion settings:

- `inputPath`: Source directory for images
- `outputPath`: Destination directory for converted images (defaults to inputPath)
- `quality`: Conversion quality (1-100, default: 80)
- `includePatterns`: Glob patterns for files to include
- `excludePatterns`: Glob patterns for files to exclude

#### Step 3: Run Conversion

```bash
itgreen convert:webp
```

**Config Options:**

- `inputPath` (required): Source directory for images
- `outputPath` (optional): Destination directory (defaults to inputPath)
- `quality` (1-100): Conversion quality
- `includePatterns`: Array of glob patterns for files to include
- `excludePatterns`: Array of glob patterns for files to exclude

**Example Config:**

```json
{
  "webp": {
    "inputPath": "public/images",
    "outputPath": "public/webp",
    "quality": 90,
    "includePatterns": ["**/*.{png,jpg,jpeg}"],
    "excludePatterns": ["**/node_modules/**", "**/drafts/**", "**/*.webp"]
  }
}
```

## Development

### Run Dev Server

```bash
npm run dev init
npm run dev convert:webp
```

### Build

```bash
npm run build
```

This generates both ESM and CommonJS builds:

- `dist/index.js` - ES Module
- `dist/index.cjs` - CommonJS

### Type Check

```bash
npm run typecheck
```

## Commands

### Available Commands

- `init` - Initialize config file
- `convert:webp` - Convert PNG/JPG → WebP (config-based)

### Future Commands

- `gen:api` - Generate API functions/types/React Query from Swagger
- `gen:icon` - Generate Chakra Icon components from SVG
- `gen:img` - Generate image path objects
- `gen:font` - Generate Next.js Local Font from font files
- `gen:route` - Generate route path objects from Pages folder
- `gen:source` - Generate Page/API templates

## Tech Stack

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Runtime**: Node.js 18+
- **Module Format**: Dual ESM/CJS support
- **Key Libraries**:
  - `webp-converter` - Image conversion
  - `chalk` - Colored output
  - `ora` - Loading spinners
  - `glob` - File pattern matching

## License

MIT

## Contact

Your Name
