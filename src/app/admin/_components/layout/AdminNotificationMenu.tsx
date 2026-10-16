"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Trash2,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import type { AdminNotification, NotificationType } from "@/types/notification";
import NotificationTestModal from "./NotificationTestModal";

// Pleasant Web Audio synthesizer for real-time chime
function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Pleasant two-tone chime (E5 -> B5)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);

    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);

    setTimeout(() => {
      ctx.close();
    }, 600);
  } catch {
    // AudioContext might be blocked until user interacts with the page
  }
}

function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 15) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export default function AdminNotificationMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | NotificationType>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial notifications from DB
  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Connect to Socket.IO for real-time notification stream
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : "http://localhost:3001");

    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join:admin");
      // Resync any notifications that may have arrived while offline
      loadNotifications();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
    });

    socket.on("admin:notification", (notification: AdminNotification) => {
      // 1. Play sound
      playNotificationChime();

      // 2. Animate bell icon
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1200);

      // 3. Update state instantly
      setNotifications((prev) => [
        notification,
        ...prev.filter((n) => n._id !== notification._id),
      ]);
      setUnreadCount((c) => c + 1);

      // 4. Show Toast popup with click-through
      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              if (notification.link) router.push(notification.link);
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/10 dark:ring-white/10 p-3.5 gap-3 cursor-pointer hover:scale-[1.02] transition-transform border-l-4 ${
              notification.type === "order"
                ? "border-l-indigo-500"
                : notification.type === "payment"
                ? "border-l-emerald-500"
                : "border-l-sky-500"
            }`}
          >
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800">
              {notification.type === "order" && (
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
              {notification.type === "payment" && (
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              {notification.type === "contact" && (
                <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {notification.type}
                </span>
                <span className="text-[9px] font-bold text-gray-400">Just now</span>
              </div>
              <p className="text-xs font-black text-gray-900 dark:text-white truncate mt-1">
                {notification.title}
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5 font-medium">
                {notification.message}
              </p>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-right" }
      );
    });

    // Re-sync when tab regains focus or visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!socket.connected) socket.connect();
        loadNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    // Periodic background sync every 15s to guarantee 100% consistency
    const syncInterval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      clearInterval(syncInterval);
      socket.disconnect();
    };
  }, [router, loadNotifications]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications cleared");
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "all" ? true : n.type === activeTab
  );

  return (
    <>
      <div ref={containerRef} className="relative inline-block text-left">
        {/* Bell Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center relative shadow-xs transition-all cursor-pointer ${
            isAnimating ? "scale-115 text-indigo-600 dark:text-indigo-400" : ""
          }`}
          aria-label="Notifications"
          title={isConnected ? "Socket.IO Live Connected" : "Connecting to socket..."}
        >
          <Bell className={`w-4 h-4 transition-transform ${isAnimating ? "rotate-12" : ""}`} />

          {/* Unread Counter Badge */}
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : isConnected ? (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-gray-900"
              title="Real-time socket connected"
            />
          ) : null}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">Mark read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 mt-3 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs font-black"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab("order")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === "order"
                      ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === "payment"
                      ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === "contact"
                      ? "bg-white dark:bg-gray-900 text-sky-600 dark:text-sky-400 shadow-xs font-black"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Contact
                </button>
              </div>
            </div>

            {/* List Area */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mx-auto flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    No notifications yet
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Real-time updates for orders, payments & contacts appear here automatically.
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsTestModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-black transition-colors cursor-pointer"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Open Test Studio
                    </button>
                  </div>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isUnread = !notif.isRead;
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id, notif.link)}
                      className={`p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer flex items-start gap-3 relative ${
                        isUnread
                          ? "bg-indigo-50/30 dark:bg-indigo-950/15"
                          : "opacity-85"
                      }`}
                    >
                      {/* Category Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                          notif.type === "order"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                            : notif.type === "payment"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                        }`}
                      >
                        {notif.type === "order" && <ShoppingBag className="w-4 h-4" />}
                        {notif.type === "payment" && <CreditCard className="w-4 h-4" />}
                        {notif.type === "contact" && <MessageSquare className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              notif.type === "order"
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                                : notif.type === "payment"
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                : "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
                            }`}
                          >
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>

                        <p
                          className={`text-xs font-bold text-gray-900 dark:text-white mt-1 truncate ${
                            isUnread ? "font-black" : ""
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>

                      {/* Unread indicator dot */}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-2 self-start animate-pulse" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Bar */}
            <div className="p-2.5 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400 px-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span>{isConnected ? "Socket.IO Live" : "Connecting..."}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsTestModalOpen(true);
                }}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-black cursor-pointer hover:underline"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Test Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Notification Test Studio Modal */}
      <NotificationTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        isConnected={isConnected}
        onPlayChime={playNotificationChime}
      />
    </>
  );
}
