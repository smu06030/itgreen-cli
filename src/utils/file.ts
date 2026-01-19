import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

/**
 * 지정된 패턴에 맞는 파일들을 검색합니다.
 */
export async function findFiles(
  pattern: string,
  options?: { cwd?: string; recursive?: boolean },
): Promise<string[]> {
  const globPattern = options?.recursive ? `**/${pattern}` : pattern;

  return await glob(globPattern, {
    cwd: options?.cwd || process.cwd(),
    absolute: true,
    nodir: true,
  });
}

/**
 * 파일이 존재하는지 확인합니다.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 디렉토리가 존재하는지 확인합니다.
 */
export function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * 파일 확장자를 변경합니다.
 */
export function changeExtension(filePath: string, newExt: string): string {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}.${newExt}`);
}
