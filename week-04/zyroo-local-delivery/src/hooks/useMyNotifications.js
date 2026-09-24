import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";

// Convenience hook combining "who's logged in" with "their notifications",
// sorted newest-first with an unread count — used by the nav bell.
export function useMyNotifications() {
  const { user } = useAuth();
  const { forUser, markAllRead, markOneRead } = useNotifications();

  const items = useMemo(() => {
    if (!user) return [];
    return [...forUser(user)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [forUser, user]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  return {
    items,
    unreadCount,
    markAllRead: () => user && markAllRead(user),
    markOneRead,
  };
}
