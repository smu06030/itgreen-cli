export interface GenRouteConfig {
  /** 조회할 page 파일들이 포함되어있는 폴더 */
  inputPath: string;
  /** 생성될 파일이 위치할 경로 */
  outputPath: string;
  /** 생성될 route 객체의 이름 */
  displayName: string;
  /** 포함할 route 의 glob 패턴 */
  includingPattern: string[];
  /** 제외될 route 의 glob 패턴 */
  ignoredPattern: string[];
  /** key 값을 결정할 포맷함수 (기본: SNAKE_UPPER_CASE) */
  formatKey?: (filename: string) => string;
}

export interface RouteFileInfo {
  key: string;
  path: string;
  wholePath: string;
  info: {
    dir: string;
    name: string;
    ext: string;
    base: string;
  };
}
