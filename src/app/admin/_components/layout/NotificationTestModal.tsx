"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Sparkles,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Send,
  Volume2,
  Radio,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";
import Modal from "../common/Modal";
import type { NotificationType } from "@/types/notification";

interface NotificationTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onPlayChime: () => void;
}

export default function NotificationTestModal({
  isOpen,
  onClose,
  isConnected,
  onPlayChime,
}: NotificationTestModalProps) {
  const [selectedType, setSelectedType] = useState<NotificationType>("order");
  const [customTitle, setCustomTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // Quick 1-click test simulation presets
  const presets = [
    {
      type: "order" as NotificationType,
      title: "New Order #VL-9842",
      message: "Sarah Connor placed an order for $320.00 (2 items)",
      icon: ShoppingBag,
      color: "indigo",
      tag: "Customer Checkout",
    },
    {
      type: "order" as NotificationType,
      title: "High-Value Order #VL-1092",
      message: "Marcus Vance placed an order for $1,240.00 (Black Cloud Puffer x4)",
      icon: ShoppingBag,
      color: "purple",
      tag: "VIP Order",
    },
    {
      type: "payment" as NotificationType,
      title: "Payment Confirmed: #VL-9842",
      message: "Stripe payment of $320.00 successfully processed and verified",
      icon: CreditCard,
      color: "emerald",
      tag: "Stripe Card",
    },
    {
      type: "payment" as NotificationType,
      title: "Refund Processed: #VL-3140",
      message: "Partial refund of $85.00 issued to customer card ending in 4242",
      icon: CreditCard,
      color: "amber",
      tag: "Refund",
    },
    {
      type: "contact" as NotificationType,
      title: "Customer Inquiry: Delivery Date",
      message: "Emma Watson: Hi, can you expedite shipping for order #VL-9842 to New York?",
      icon: MessageSquare,
      color: "sky",
      tag: "Help Center",
    },
    {
      type: "contact" as NotificationType,
      title: "Product Question: Size Guide",
      message: "David Miller: Does the Studio Hanger Coat run true to size or oversized?",
      icon: MessageSquare,
      color: "blue",
      tag: "Product Query",
    },
  ];

  const handleSendPreset = async (preset: {
    type: NotificationType;
    title: string;
    message: string;
  }) => {
    try {
      setIsSending(true);
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const json = await res.json();
      if (json.success) {
        setSentCount((c) => c + 1);
        toast.success(`Dispatched ${preset.type.toUpperCase()} live notification!`);
      } else {
        toast.error("Failed to dispatch test notification");
      }
    } catch (err) {
      console.error("Test send error:", err);
      toast.error("Failed to reach test endpoint");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customMessage.trim()) {
      toast.error("Please enter both a title and message");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: customTitle.trim(),
          message: customMessage.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSentCount((c) => c + 1);
        toast.success(`Custom ${selectedType.toUpperCase()} notification broadcasted!`);
        setCustomTitle("");
        setCustomMessage("");
      } else {
        toast.error("Failed to dispatch custom notification");
      }
    } catch (err) {
      console.error("Custom test error:", err);
      toast.error("Failed to dispatch notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Live Test Studio" maxWidth="3xl">
      <div className="space-y-6">
        {/* Connection Diagnostics Banner */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-rose-500"
              }`}
            />
            <div>
              <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                Socket.IO Status:{" "}
                <span className={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                  {isConnected ? "Active & Listening (Port 3001)" : "Disconnected"}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Dispatched events broadcast simultaneously to all open admin windows in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPlayChime}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              Test Chime
            </button>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {sentCount} Dispatched
            </span>
          </div>
        </div>

        {/* Section 1: Instant 1-Click Simulator Presets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Instant 1-Click Simulation Presets
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {presets.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSendPreset(preset)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      preset.type === "order"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : preset.type === "payment"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {preset.tag}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                        Send <Send className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <p className="text-xs font-black text-gray-900 dark:text-white mt-1 truncate">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-medium">
                      {preset.message}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Custom Notification Builder */}
        <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Custom Notification Generator
            </h4>
          </div>

          <form onSubmit={handleSendCustom} className="space-y-3">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["order", "payment", "contact"] as NotificationType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    selectedType === type
                      ? type === "order"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : type === "payment"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-sky-600 text-white border-sky-600 shadow-sm"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {type === "order" && <ShoppingBag className="w-3.5 h-3.5" />}
                  {type === "payment" && <CreditCard className="w-3.5 h-3.5" />}
                  {type === "contact" && <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{type}</span>
                </button>
              ))}
            </div>

            {/* Custom Title */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Notification Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={`e.g. Special ${selectedType.toUpperCase()} Alert`}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Custom Message */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Notification Message Body
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter details of the simulated customer event..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSending || !customTitle.trim() || !customMessage.trim()}
                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 text-xs font-black tracking-wide flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Emit Real-Time Notification</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
