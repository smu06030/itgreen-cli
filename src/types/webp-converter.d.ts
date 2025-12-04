declare module "webp-converter" {
  export function grant_permission(): void;
  export function cwebp(
    input: string,
    output: string,
    options: string
  ): Promise<string>;
  export default {
    grant_permission,
    cwebp,
  };
}
