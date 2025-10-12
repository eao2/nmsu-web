// app/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const socket = useSocket();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    if (socket) {
      socket.on("notification", (notification) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [notification, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off("notification");
      }
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications?unreadOnly=true`);
      const data = await response.json();
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch(`${apiUrl}/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount(Math.max(0, unreadCount - ids.length));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead([id]);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex flex-col pb-16">
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground dark:text-zinc-100 mb-2">
            Мэдэгдлүүд
          </h1>
          <p className="text-muted-foreground dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} уншаагүй мэдэгдэл байна`
              : "Шинэ мэдэгдэл байхгүй байна"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card dark:bg-zinc-900 rounded-xl p-8 text-center border border-zinc-300 dark:border-zinc-800">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-zinc-100 mb-2">
              Мэдэгдэл байхгүй байна
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              Танд одоогоор мэдэгдэл ирээгүй байна
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`my-2 relative rounded-xl p-4 border transition-colors duration-200 cursor-pointer 
                    ${
                      notif.isRead
                        ? "bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30" // slightly more visible
                        : "bg-card hover:bg-muted/50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                    }`}
                onClick={() => handleNotificationClick(notif.id)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground dark:text-zinc-100 mb-1">
                      {notif.title}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                      {notif.message}
                    </p>
                    <span className="text-xs text-muted-foreground dark:text-gray-500">
                      {new Date(notif.createdAt).toLocaleDateString("mn-MN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="ml-3 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="fixed z-100 w-full bottom-0 border-t border-zinc-300 dark:border-zinc-800 bg-card dark:bg-zinc-900 p-4">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex justify-center items-center border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700 w-10 h-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle dark:text-zinc-100" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
            </svg>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
            >
              Бүгдийг уншсан
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
