"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerPushNotifications } from "@/lib/push-registration"; // Import the registration function

export default function NotificationBell() {
  const socket = useSocket();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  // State to manage the push notification permission prompt
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);

    fetchUnreadCount();
    fetchNotifications();

    // Check for push notification permission and show prompt if needed
    if ("Notification" in window && Notification.permission === "default") {
      setShowPushPrompt(true);
    }

    if (socket) {
      socket.on("notification", (notification) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [notification, ...prev]);
        
        // Show browser notification if permission is already granted
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/icons/icon-192x192.png",
          });
        }
      });
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      if (socket) {
        socket.off("notification");
      }
    };
  }, [socket]);

  // Handler to enable push notifications
  const handleEnablePush = async () => {
    await registerPushNotifications();
    setShowPushPrompt(false);
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications`);
      const data = await response.json();
      setNotifications(data.slice(0, 5));
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch(`${apiUrl}/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
      });
      setUnreadCount(Math.max(0, unreadCount - ids.length));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleBellClick = () => {
    if (isMobile) {
      router.push("/notifications");
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      {/* Push Notification Permission Prompt */}
      {showPushPrompt && (
        <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-card border rounded-xl shadow-lg z-50 dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-sm text-foreground dark:text-zinc-300 mb-2">
            Get notified even when the tab is closed?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnablePush}
              className="flex-1 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={() => setShowPushPrompt(false)}
              className="flex-1 bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-md hover:bg-muted/80 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="h-12 w-12 relative p-2 bg-muted/50 hover:bg-muted/50 rounded-xl transition-colors duration-200 dark:bg-zinc-800 dark:hover:bg-zinc-800"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="fill-zinc-900 dark:fill-zinc-300" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-zinc-900 dark:fill-zinc-300" fillRule="evenodd" clipRule="evenodd" d="M12 1.25C7.71983 1.25 4.25004 4.71979 4.25004 9V9.7041C4.25004 10.401 4.04375 11.0824 3.65717 11.6622L2.50856 13.3851C1.17547 15.3848 2.19318 18.1028 4.51177 18.7351C5.26738 18.9412 6.02937 19.1155 6.79578 19.2581L6.79768 19.2632C7.56667 21.3151 9.62198 22.75 12 22.75C14.378 22.75 16.4333 21.3151 17.2023 19.2632L17.2042 19.2581C17.9706 19.1155 18.7327 18.9412 19.4883 18.7351C21.8069 18.1028 22.8246 15.3848 21.4915 13.3851L20.3429 11.6622C19.9563 11.0824 19.75 10.401 19.75 9.7041V9C19.75 4.71979 16.2802 1.25 12 1.25ZM15.3764 19.537C13.1335 19.805 10.8664 19.8049 8.62349 19.5369C9.33444 20.5585 10.571 21.25 12 21.25C13.4289 21.25 14.6655 20.5585 15.3764 19.537ZM5.75004 9C5.75004 5.54822 8.54826 2.75 12 2.75C15.4518 2.75 18.25 5.54822 18.25 9V9.7041C18.25 10.6972 18.544 11.668 19.0948 12.4943L20.2434 14.2172C21.0086 15.3649 20.4245 16.925 19.0936 17.288C14.4494 18.5546 9.5507 18.5546 4.90644 17.288C3.57561 16.925 2.99147 15.3649 3.75664 14.2172L4.90524 12.4943C5.45609 11.668 5.75004 10.6972 5.75004 9.7041V9Z" fill="currenColor"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-zinc-300 text-[10px] font-bold rounded-full flex items-center justify-center border border-red-600 dark:border-red-400">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && !isMobile && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl z-50 dark:bg-zinc-900 dark:border-zinc-800 bg-zinc-100 border-zinc-300 shadow-lg">
            <div className="p-4 border-b border-zinc-300 flex items-center justify-between dark:border-zinc-700">
              <h3 className="font-semibold text-foreground text-sm dark:text-zinc-300">
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
                  className="bg-zinc-100 text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:text-gray-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-all mr-1" viewBox="0 0 16 16">
                    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
                  </svg>
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
                    <h4 className="font-medium text-sm text-foreground mb-1 dark:text-zinc-300">
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
              className="block p-3 text-center text-sm text-primary hover:bg-muted/50 border-t border-zinc-300 transition-colors duration-200 no-underline dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
              onClick={() => setIsOpen(false)}
            >
              Бүх мэдэглийг харах
            </Link>
          </div>
        </>
      )}
    </div>
  );
}