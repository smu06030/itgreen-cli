export interface GenApiConfig {
  swaggerSchemaUrl: string;
  outputPath: string;
  includeReactQuery: boolean;
  includeReactInfiniteQuery: boolean;
  axiosInstancePath: string;
  paginations: PaginationConfig[];
}

export interface PaginationConfig {
  keywords: string[];
  nextKey: string;
  initialPageParam?: string;
  getNextPage?: string;
  getNextPageParam?: string;
}
