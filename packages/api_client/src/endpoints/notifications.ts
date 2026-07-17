import type { ApiClient } from "../types";

// PROVISIONAL — no notifications router exists on the backend yet. Shapes
// are a best guess from docs/tasks/00-foundation/03-bottom-nav-component.md's
// `GET /api/v1/notifications/unread-count`, not verified against any real
// contract (that task also isn't built).
export interface NotificationOut {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsEndpoints {
  list(signal?: AbortSignal): Promise<NotificationOut[]>;
  unreadCount(signal?: AbortSignal): Promise<number>;
  markAsRead(notificationId: string, signal?: AbortSignal): Promise<void>;
}

export function createNotificationsEndpoints(client: ApiClient): NotificationsEndpoints {
  return {
    list: (signal) => client.request<NotificationOut[]>("/notifications", { signal }),
    unreadCount: (signal) =>
      client
        .request<{ count: number }>("/notifications/unread-count", { signal })
        .then((res) => res.count),
    markAsRead: (notificationId, signal) =>
      client.request<void>(`/notifications/${notificationId}/read`, { method: "POST", signal }),
  };
}
