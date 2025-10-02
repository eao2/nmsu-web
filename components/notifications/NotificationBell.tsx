"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketProvider";
import Link from "next/link";

export default function NotificationBell() {
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    if (socket) {
      socket.on("notification", (notification) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [notification, ...prev]);

        // Request permission and show browser notification
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/icons/icon-192x192.png",
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("notification");
      }
    };
  }, [socket]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unreadOnly=true");
      const data = await response.json();
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      setNotifications(data.slice(0, 5));
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
      });
      setUnreadCount(Math.max(0, unreadCount - ids.length));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 relative p-2 bg-muted/50 hover:bg-muted/50 rounded-xl transition-colors duration-200 dark:bg-zinc-800 dark:hover:bg-zinc-800"
      >
        <svg
          className="w-6 h-6 text-foreground dark:text-white"
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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-red-600 dark:border-red-400">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl z-50 dark:bg-zinc-900 dark:border-zinc-800 bg-white border-zinc-300">
            <div className="p-4 border-b border-zinc-300 flex items-center justify-between dark:border-zinc-700">
              <h3 className="font-semibold text-foreground text-sm dark:text-white">
                Мэдэгдлүүд
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    const unreadIds = notifications
                      .filter((n) => !n.isRead)
                      .map((n) => n.id);
                    markAsRead(unreadIds);
                  }}
                  className="bg-white text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200 dark:text-white dark:bg-zinc-900 dark:hover:text-gray-300"
                >
                  Бүгдийг уншсан гэж тэмдэглэх
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm dark:text-gray-400">
                  Мэдэгдэл байхгүй байна
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-zinc-300 hover:bg-muted/50 cursor-pointer transition-colors duration-200 dark:border-zinc-700 dark:hover:bg-zinc-800/50 ${
                      !notif.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      markAsRead([notif.id]);
                      setIsOpen(false);
                    }}
                  >
                    <h4 className="font-medium text-sm text-foreground mb-1 dark:text-white">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 dark:text-gray-400">
                      {notif.message}
                    </p>
                    <span className="text-xs text-muted-foreground dark:text-gray-500">
                      {new Date(notif.createdAt).toLocaleDateString("mn-MN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/notifications"
              className="block p-3 text-center text-sm text-primary hover:bg-muted/50 border-t border-zinc-300 transition-colors duration-200 no-underline dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800/50"
              onClick={() => setIsOpen(false)}
            >
              Бүх мэдэгдлийг харах
            </Link>
          </div>
        </>
      )}
    </div>
  );
}