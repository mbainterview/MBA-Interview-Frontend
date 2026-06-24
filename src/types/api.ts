// ─── Pagination ──────────────────────────────────────────────────────────────
// Matches backend PaginationMetaDto from src/common/dto/

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

/** Paginated response shape after axios envelope unwrapping */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Error ───────────────────────────────────────────────────────────────────
// Matches backend error envelope: { success: false, error: { code, message, ... } }

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  retryAfter?: number;
}

// ─── Query Parameters ────────────────────────────────────────────────────────
// Matches backend PaginationQueryDto

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}
