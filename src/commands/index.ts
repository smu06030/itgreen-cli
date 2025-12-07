import type { Command } from "commander";
import { registerConvertCommands } from "./convert/index.js";
import { registerInitCommands } from "./init/index.js";
import { registerGenCommands } from "./gen/index.js";

export function registerAllCommands(program: Command): void {
  registerInitCommands(program);
  registerConvertCommands(program);
  registerGenCommands(program);
  // 향후 명령어를 여기에 추가할 수 있습니다
}
