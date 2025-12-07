export interface GenImgConfig {
  /** 조회할 img 파일들이 포함되어있는 폴더 */
  inputPath: string;
  /** 생성될 파일이 위치할 경로 */
  outputPath: string;
  /** 생성될 image 객체의 이름 */
  displayName: string;
  /** 생성될 객체의 value에 할당될 경로의 base-path */
  basePath: string;
  /** 생성될 이미지 파일을 판별하는 패턴 */
  includingPattern: string[];
  /** 제외될 이미지 파일을 판별하는 패턴 */
  ignoredPattern: string[];
  /** key 값을 결정할 포맷함수 (기본: SNAKE_UPPER_CASE) */
  formatKey?: (filename: string) => string;
}

export interface ImageObject {
  src: string;
  alt: string;
}

export interface FileInfo {
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
