export type OffsetPagination<T> = {
  limit: number;
  offset: number;
  total: number;
  data: T[];
};
