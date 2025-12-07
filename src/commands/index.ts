import type { Command } from "commander";
import { registerConvertCommands } from "./convert/index.js";
import { registerInitCommands } from "./init/index.js";
import { registerGenCommands } from "./gen/index.js";

export function registerAllCommands(program: Command): void {
  registerInitCommands(program);
  registerConvertCommands(program);
  registerGenCommands(program);
  // Future commands can be added here
}
