import type { ApiClient } from "../types";

// PROVISIONAL — no comments router exists on the backend yet. Shapes are a
// best guess from docs/features.md's moderated-comments tag system, not
// verified against any real contract.
export interface CommentOut {
  id: string;
  reportId: string;
  authorId: string;
  tag: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  tag: string;
}

export interface CommentsEndpoints {
  list(reportId: string, signal?: AbortSignal): Promise<CommentOut[]>;
  create(reportId: string, body: CreateCommentRequest, signal?: AbortSignal): Promise<CommentOut>;
}

export function createCommentsEndpoints(client: ApiClient): CommentsEndpoints {
  return {
    list: (reportId, signal) =>
      client.request<CommentOut[]>(`/reports/${reportId}/comments`, { signal }),
    create: (reportId, body, signal) =>
      client.request<CommentOut>(`/reports/${reportId}/comments`, {
        method: "POST",
        body,
        signal,
      }),
  };
}
