#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerAllCommands } from "./commands/index.js";

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// package.json에서 버전 정보 읽기
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// CLI 프로그램 생성
const program = new Command();

program
  .name("itgreen")
  .description("A versatile CLI tool for ITGreen development tasks")
  .version(packageJson.version);

// 모든 명령어 등록
registerAllCommands(program);

// CLI 실행
program.parse(process.argv);

// 명령어가 제공되지 않으면 도움말 표시
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
