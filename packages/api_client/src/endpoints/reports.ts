import type { ApiClient } from "../types";

// PROVISIONAL — apps/backend/app/routers/ has no reports router yet (only
// auth.py and users.py exist today). These shapes are a best guess from
// docs/features.md, not verified against any real contract. Update once a
// reports task ships the actual backend routes.
export interface ReportOut {
  id: string;
  category: string;
  status: string;
  description: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface CreateReportRequest {
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export interface ListReportsParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface ReportsListResponse {
  reports: ReportOut[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportsEndpoints {
  list(params?: ListReportsParams, signal?: AbortSignal): Promise<ReportsListResponse>;
  get(reportId: string, signal?: AbortSignal): Promise<ReportOut>;
  create(body: CreateReportRequest, signal?: AbortSignal): Promise<ReportOut>;
}

export function createReportsEndpoints(client: ApiClient): ReportsEndpoints {
  return {
    list: (params = {}, signal) =>
      client.request<ReportsListResponse>("/reports", {
        query: { page: params.page, page_size: params.pageSize, status: params.status },
        signal,
      }),
    get: (reportId, signal) => client.request<ReportOut>(`/reports/${reportId}`, { signal }),
    create: (body, signal) =>
      client.request<ReportOut>("/reports", { method: "POST", body, signal }),
  };
}
