// ================================================================
// Notifications — API_DOCUMENTATION.md §14
// Always scoped server-side to the current user's own notifications
// (userId = me.id OR role = me.role) — no client filtering needed.
// ================================================================

import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

class NotificationService {
  list() {
    return apiClient.get<Notification[]>("/notifications");
  }
  markRead(id: number) {
    return apiClient.patch<Notification>(`/notifications/${id}/read`);
  }
  markAllRead() {
    return apiClient.patch<void>("/notifications/read-all");
  }
}

export const notificationService = new NotificationService();

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationService.list(),
    refetchInterval: 30_000, // simple polling — swap for a websocket/SSE post-hackathon
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markRead.bind(notificationService),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead.bind(notificationService),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
