"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  Zap,
  ShieldCheck,
  Building2,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import type {
  PaymentMethodConfig,
  PaymentMethodProvider,
  TestPaymentConnectionResult,
} from "@/types";

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PaymentMethodProvider>("stripe");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form states
  const [isEnabled, setIsEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  // Visibility toggles for secrets
  const [showPublishableKey, setShowPublishableKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showKeyId, setShowKeyId] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  // Test module result
  const [testResult, setTestResult] = useState<TestPaymentConnectionResult | null>(null);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-methods");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMethods(json.data);
        loadProviderIntoForm(selectedProvider, json.data);
      } else {
        toast.error(json.error || "Failed to load payment methods");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProviderIntoForm = (prov: PaymentMethodProvider, list = methods) => {
    const item = list.find((m) => m.provider === prov);
    if (item) {
      setIsEnabled(item.isEnabled);
      setIsTestMode(item.isTestMode);
      setPublishableKey(item.publishableKey || "");
      setSecretKey(item.secretKey || "");
      setKeyId(item.keyId || "");
      setKeySecret(item.keySecret || "");
      setClientId(item.clientId || "");
      setClientSecret(item.clientSecret || "");
    } else {
      setIsEnabled(false);
      setIsTestMode(true);
      setPublishableKey("");
      setSecretKey("");
      setKeyId("");
      setKeySecret("");
      setClientId("");
      setClientSecret("");
    }
    setTestResult(null);
  };

  const handleProviderSelect = (prov: PaymentMethodProvider) => {
    setSelectedProvider(prov);
    loadProviderIntoForm(prov);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        provider: selectedProvider,
        name:
          selectedProvider === "stripe"
            ? "Stripe"
            : selectedProvider === "razorpay"
            ? "Razorpay"
            : selectedProvider === "paypal"
            ? "PayPal"
            : "Cash on Delivery",
        isEnabled,
        isTestMode,
        publishableKey,
        secretKey,
        keyId,
        keySecret,
        clientId,
        clientSecret,
      };

      const res = await fetch("/api/admin/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Payment method saved successfully!");
        fetchMethods();
      } else {
        toast.error(json.error || "Failed to save payment method");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const payload = {
        provider: selectedProvider,
        isTestMode,
        publishableKey,
        secretKey,
        keyId,
        keySecret,
        clientId,
        clientSecret,
      };

      const res = await fetch("/api/admin/payment-methods/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTestResult(json.data);
        toast.success(json.message || "Test connection verified successfully!");
      } else {
        const errorResult: TestPaymentConnectionResult = {
          success: false,
          message: json.error || "Test connection failed.",
          provider: selectedProvider,
          isTestMode,
          timestamp: new Date().toISOString(),
          details: json.data?.details,
        };
        setTestResult(errorResult);
        toast.error(json.error || "Test connection failed");
      }
    } catch {
      toast.error("Failed to execute test connection.");
    } finally {
      setTesting(false);
    }
  };

  const currentConfig = methods.find((m) => m.provider === selectedProvider);
  const activeGatewaysCount = methods.filter((m) => m.isEnabled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Admin Module
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Settings / Payments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            Payment Methods Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure payment gateways, upload secret keys for Stripe & Razorpay, toggle environment modes, and test connection credentials.
          </p>
        </div>

        <button
          onClick={fetchMethods}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Gateways</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{activeGatewaysCount} / {methods.length || 4}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Stripe Status</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
              {methods.find((m) => m.provider === "stripe")?.isEnabled ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Active
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Razorpay Status</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
              {methods.find((m) => m.provider === "razorpay")?.isEnabled ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Active
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Security Mode</div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
              Encrypted Keys
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Method Selector Dropdown */}
        <div className="space-y-2">
          <label htmlFor="payment-provider-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select Payment Gateway / Method:
          </label>
          <div className="relative max-w-md">
            <select
              id="payment-provider-select"
              value={selectedProvider}
              onChange={(e) => handleProviderSelect(e.target.value as PaymentMethodProvider)}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium text-sm transition-all"
            >
              <option value="stripe">Stripe Gateway (Credit/Debit, Apple Pay)</option>
              <option value="razorpay">Razorpay Gateway (UPI, NetBanking, Cards)</option>
              <option value="paypal">PayPal Gateway (International Cards)</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Provider Header & Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center shrink-0">
                {selectedProvider === "stripe" ? (
                  <Zap className="h-5 w-5" />
                ) : selectedProvider === "razorpay" ? (
                  <Building2 className="h-5 w-5" />
                ) : selectedProvider === "paypal" ? (
                  <CreditCard className="h-5 w-5" />
                ) : (
                  <Smartphone className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                  {selectedProvider === "stripe"
                    ? "Stripe Credentials"
                    : selectedProvider === "razorpay"
                    ? "Razorpay Credentials"
                    : selectedProvider === "paypal"
                    ? "PayPal Credentials"
                    : "Cash on Delivery Settings"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedProvider === "stripe"
                    ? "Upload 2 Stripe secrets: Publishable Key and Secret Key."
                    : selectedProvider === "razorpay"
                    ? "Upload Razorpay Key ID and Key Secret."
                    : selectedProvider === "paypal"
                    ? "Upload PayPal Client ID and Client Secret."
                    : "Configure Cash on Delivery payment option."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Enable / Disable Switch */}
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-emerald-600"></div>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>

              {/* Test / Live Mode Switch */}
              {selectedProvider !== "cod" && (
                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-amber-500 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-amber-600"></div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {isTestMode ? "Test Mode" : "Live Mode"}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Form Secret Fields */}
          {selectedProvider === "stripe" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stripe Field 1: Publishable Key */}
                <div className="space-y-1.5">
                  <label htmlFor="stripe-publishable-key" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Publishable Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="stripe-publishable-key"
                      type={showPublishableKey ? "text" : "password"}
                      value={publishableKey}
                      onChange={(e) => setPublishableKey(e.target.value)}
                      placeholder={isTestMode ? "pk_test_..." : "pk_live_..."}
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPublishableKey(!showPublishableKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPublishableKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Stripe client-side key (starts with {isTestMode ? "pk_test_" : "pk_live_"}).
                  </p>
                </div>

                {/* Stripe Field 2: Secret Key */}
                <div className="space-y-1.5">
                  <label htmlFor="stripe-secret-key" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="stripe-secret-key"
                      type={showSecretKey ? "text" : "password"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder={isTestMode ? "sk_test_..." : "sk_live_..."}
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Stripe server secret key (starts with {isTestMode ? "sk_test_" : "sk_live_"}).
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedProvider === "razorpay" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Razorpay Key ID */}
                <div className="space-y-1.5">
                  <label htmlFor="razorpay-key-id" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Key ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="razorpay-key-id"
                      type={showKeyId ? "text" : "password"}
                      value={keyId}
                      onChange={(e) => setKeyId(e.target.value)}
                      placeholder={isTestMode ? "rzp_test_..." : "rzp_live_..."}
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyId(!showKeyId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showKeyId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Razorpay Key ID ({isTestMode ? "rzp_test_..." : "rzp_live_..."}).
                  </p>
                </div>

                {/* Razorpay Key Secret */}
                <div className="space-y-1.5">
                  <label htmlFor="razorpay-key-secret" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Key Secret <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="razorpay-key-secret"
                      type={showKeySecret ? "text" : "password"}
                      value={keySecret}
                      onChange={(e) => setKeySecret(e.target.value)}
                      placeholder="Razorpay secret key"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showKeySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Razorpay confidential secret string.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedProvider === "paypal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="paypal-client-id" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Client ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="paypal-client-id"
                      type={showClientId ? "text" : "password"}
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="PayPal Client ID"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientId(!showClientId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="paypal-client-secret" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Client Secret <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="paypal-client-secret"
                      type={showClientSecret ? "text" : "password"}
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="PayPal Client Secret"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedProvider === "cod" && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-sm text-blue-900 dark:text-blue-200">
              Cash on Delivery requires no API secret keys. Enabling this option will present Cash on Delivery at checkout.
            </div>
          )}

          {/* Test Module Output Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                testResult.success
                  ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span>Test Module Result: {testResult.success ? "Passed" : "Failed"}</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">
                  {new Date(testResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs">{testResult.message}</p>

              {testResult.details && (
                <div className="pt-2 text-[11px] font-mono grid grid-cols-2 gap-2 opacity-90 border-t border-current/10">
                  {Object.entries(testResult.details).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span>{key}:</span>
                      <span className={val ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-red-600 dark:text-red-400"}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Credentials..." : "Save Credentials"}
            </button>

            {selectedProvider !== "cod" && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-50"
              >
                <Zap className={`h-4 w-4 ${testing ? "animate-bounce" : ""}`} />
                {testing ? "Testing Module..." : "Test Connection"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Overview Table of Configured Methods */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Configured Payment Gateways
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Name</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Secrets Configured</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {methods.map((item) => {
                const hasSecrets =
                  item.provider === "stripe"
                    ? !!(item.publishableKey && item.secretKey)
                    : item.provider === "razorpay"
                    ? !!(item.keyId && item.keySecret)
                    : item.provider === "paypal"
                    ? !!(item.clientId && item.clientSecret)
                    : true;

                return (
                  <tr key={item.provider} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs uppercase">{item.provider}</td>
                    <td className="py-3.5 px-4">
                      {item.isEnabled ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.provider === "cod" ? (
                        <span className="text-xs text-gray-400">N/A</span>
                      ) : item.isTestMode ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Test / Sandbox
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          Live Production
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {hasSecrets ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Missing Secrets
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleProviderSelect(item.provider)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                      >
                        {selectedProvider === item.provider ? "Editing" : "Configure"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
