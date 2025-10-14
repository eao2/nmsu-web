"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerPushNotifications } from "@/lib/push-registration";

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);

    fetchUnreadCount();
    fetchNotifications();

    if ("Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => setShowPushPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleEnablePush = async () => {
    try {
      await registerPushNotifications();
      setShowPushPrompt(false);
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      alert("Failed to enable push notifications. Please try again.");
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications?unreadOnly=true`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch unread count");
      const data = await response.json();
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications?limit=5`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
      });
      
      if (!response.ok) throw new Error("Failed to mark as read");
      
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAllRead(true);
    try {
      const unreadResponse = await fetch(`${apiUrl}/api/notifications?unreadOnly=true`, {
        credentials: 'include',
      });

      if (!unreadResponse.ok) {
        throw new Error("Failed to fetch unread notifications.");
      }

      const unreadNotifications = await unreadResponse.json();
      const unreadIds = unreadNotifications.map((n: any) => n.id);

      if (unreadIds.length === 0) {
        setUnreadCount(0);
        setIsMarkingAllRead(false);
        return;
      }

      const patchResponse = await fetch(`${apiUrl}/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
          notificationIds: unreadIds, 
          markAsRead: true 
        }),
      });

      if (!patchResponse.ok) {
        throw new Error("Failed to mark all notifications as read.");
      }

      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

    } catch (error) {
      console.error("Mark all as read error:", error);
      alert("Could not mark all notifications as read. Please try again.");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleBellClick = () => {
    if (isMobile) {
      router.push("/notifications");
    } else {
      setIsOpen(!isOpen);
      if (!isOpen) {
        fetchNotifications();
      }
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsRead([notif.id]);
    }
    setIsOpen(false);
    
    if (notif.data?.url) {
      router.push(notif.data.url);
    }
  };

  return (
    <div className="relative">
      {showPushPrompt && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top duration-300">
          <div className="bg-zinc-100 border rounded-2xl shadow-2xl p-4 dark:bg-zinc-900 dark:border-zinc-800 relative">
            <button
              onClick={() => setShowPushPrompt(false)}
              className="absolute top-3 right-3 rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground transition-colors bg-transparent text-zinc-900 dark:text-zinc-100"
              aria-label="Хаах"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-2">
              <div className="flex-1 pt-1">
                <h3 className="text-base font-semibold text-foreground dark:text-zinc-200 mb-1">
                  Мэдэгдэл идэвхжүүлэх үү?
                </h3>
                <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4">
                  Шинэ мэдээллүүдийг шууд хүлээн авна.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleEnablePush}
                    className="flex-1 bg-black text-zinc-100 text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-primary/80"
                  >
                    Идэвхжүүлэх
                  </button>
                  <button
                    onClick={() => setShowPushPrompt(false)}
                    className="flex-1 bg-muted text-muted-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Дараа
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBellClick}
        className="h-12 w-12 relative p-2 bg-muted/50 hover:bg-muted/50 rounded-xl transition-colors duration-200 dark:bg-zinc-800 dark:hover:bg-zinc-800"
        aria-label="Мэдэгдэл"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="fill-zinc-900 dark:fill-zinc-300" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            className="fill-zinc-900 dark:fill-zinc-300" 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12 1.25C7.71983 1.25 4.25004 4.71979 4.25004 9V9.7041C4.25004 10.401 4.04375 11.0824 3.65717 11.6622L2.50856 13.3851C1.17547 15.3848 2.19318 18.1028 4.51177 18.7351C5.26738 18.9412 6.02937 19.1155 6.79578 19.2581L6.79768 19.2632C7.56667 21.3151 9.62198 22.75 12 22.75C14.378 22.75 16.4333 21.3151 17.2023 19.2632L17.2042 19.2581C17.9706 19.1155 18.7327 18.9412 19.4883 18.7351C21.8069 18.1028 22.8246 15.3848 21.4915 13.3851L20.3429 11.6622C19.9563 11.0824 19.75 10.401 19.75 9.7041V9C19.75 4.71979 16.2802 1.25 12 1.25ZM15.3764 19.537C13.1335 19.805 10.8664 19.8049 8.62349 19.5369C9.33444 20.5585 10.571 21.25 12 21.25C13.4289 21.25 14.6655 20.5585 15.3764 19.537ZM5.75004 9C5.75004 5.54822 8.54826 2.75 12 2.75C15.4518 2.75 18.25 5.54822 18.25 9V9.7041C18.25 10.6972 18.544 11.668 19.0948 12.4943L20.2434 14.2172C21.0086 15.3649 20.4245 16.925 19.0936 17.288C14.4494 18.5546 9.5507 18.5546 4.90644 17.288C3.57561 16.925 2.99147 15.3649 3.75664 14.2172L4.90524 12.4943C5.45609 11.668 5.75004 10.6972 5.75004 9.7041V9Z" 
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && !isMobile && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl z-50 dark:bg-zinc-900 dark:border-zinc-800 bg-zinc-100 border-zinc-300 shadow-lg">
            <div className="p-4 border-b border-zinc-300 flex items-center justify-between dark:border-zinc-700">
              <h3 className="font-semibold text-foreground text-sm dark:text-zinc-300">
                Мэдэгдлүүд
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAllRead}
                  className="bg-zinc-100 text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:text-gray-300 flex items-center disabled:opacity-50"
                  title="Бүгдийг уншсан гэж тэмдэглэх"
                >
                  {isMarkingAllRead ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="currentColor" 
                        className="bi bi-check-all mr-1" 
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
                      </svg>
                      Бүгдийг уншсан
                    </>
                  )}
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
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <h4 className="font-medium text-sm text-foreground mb-1 dark:text-zinc-300">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 dark:text-gray-400 line-clamp-2">
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