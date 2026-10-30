
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiRefreshCw,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import { toast } from "react-toastify";

// ========================================
// API CONFIGURATION
// ========================================

const BASE_URL = (
  import.meta.env.VITE_APP_SERVER_URL ||
  "http://localhost:5000/"
).replace(/\/+$/, "");

const API_URL = `${BASE_URL}/api/reports/today-orders`;

// ========================================
// AUTH TOKEN
// ========================================

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access-token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

// ========================================
// FORMAT HELPERS
// ========================================

const fmtBDT = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const fmtBDDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dhaka",
  }).format(date);
};

const toImg = (src) => {
  if (!src || typeof src !== "string") return null;

  if (
    /^(https?:)?\/\//i.test(src) ||
    src.startsWith("data:")
  ) {
    return src;
  }

  return `${BASE_URL}/${src.replace(/^\/+/, "")}`;
};

// ========================================
// EMPTY SUMMARY
// ========================================

const EMPTY_SUMMARY = {
  orders: 0,
  grossSales: 0,
  shipping: 0,
  itemsSold: 0,
  pending: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

// ========================================
// CALCULATE SUMMARY FROM ORDERS
// ========================================

const calculateSummary = (orders = []) => {
  return orders.reduce(
    (acc, order) => {
      const status = order.orderStatus || "pending";

      acc.orders += 1;

      acc.grossSales += Number(order.totalPrice || 0);

      acc.shipping += Number(order.shippingCost || 0);

      acc.itemsSold += (order.products || []).reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );

      if (status === "pending") {
        acc.pending += 1;
      }

      if (status === "processing") {
        acc.processing += 1;
      }

      if (status === "shipped") {
        acc.shipped += 1;
      }

      if (status === "delivered") {
        acc.delivered += 1;
      }

      if (
        status === "cancelled" ||
        status === "partially_cancelled"
      ) {
        acc.cancelled += 1;
      }

      return acc;
    },
    { ...EMPTY_SUMMARY }
  );
};

// ========================================
// SUMMARY STAT CARD
// ========================================

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// STATUS BADGE
// ========================================

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    shipped: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    partially_cancelled: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        colors[status] ||
        "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function TodayOrders() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);

  const [orders, setOrders] = useState([]);

  const [error, setError] = useState("");

  // ========================================
  // FETCH TODAY ORDERS
  // ========================================

  const fetchToday = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        withCredentials: true,
        signal,
      });

      const data = response.data;

      if (!data || !Array.isArray(data.orders)) {
        throw new Error(
          "Today Orders API response format is invalid"
        );
      }

      const fetchedOrders = data.orders;

      // Backend summary না পাঠালেও হিসাব হবে
      const calculatedSummary =
        calculateSummary(fetchedOrders);

      const finalSummary = data.summary
        ? {
            ...calculatedSummary,
            ...data.summary,
          }
        : calculatedSummary;

      setOrders(fetchedOrders);

      setSummary(finalSummary);

    } catch (err) {
      if (axios.isCancel(err)) return;

      console.error(
        "Today Orders Error:",
        err.response?.data || err.message
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "আজকের অর্ডার লোড করা যায়নি";

      setError(message);

      setOrders([]);

      setSummary(null);

      toast.error(message);

    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // ========================================
  // INITIAL FETCH
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    fetchToday(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchToday]);

  // ========================================
  // SAFE SUMMARY
  // ========================================

  const safe = summary || EMPTY_SUMMARY;

  const topOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [orders]);

  // ========================================
  // UI
  // ========================================

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="flex items-center justify-between border-b px-5 py-4">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Today Orders
          </h3>

          <p className="text-sm text-gray-500">
            আজকের অর্ডার summary + latest list
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchToday()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <FiRefreshCw
            className={
              loading
                ? "animate-spin text-gray-500"
                : "text-gray-500"
            }
          />

          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}

      {error && (
        <div
          role="alert"
          className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <strong>API Error:</strong> {error}
        </div>
      )}

      {/* ====================================
          SUMMARY CARDS
      ==================================== */}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">

        <Stat
          icon={<FiClock />}
          label="Orders"
          value={loading && !summary ? "..." : safe.orders}
        />

        <Stat
          icon={<FiPackage />}
          label="Items Sold"
          value={loading && !summary ? "..." : safe.itemsSold}
        />

        <Stat
          icon={<FiTruck />}
          label="Gross Sales"
          value={loading && !summary ? "..." : fmtBDT(safe.grossSales)}
        />

        <Stat
          icon={<FiTruck />}
          label="Shipping"
          value={loading && !summary ? "..." : fmtBDT(safe.shipping)}
        />
      </div>

      {/* ====================================
          ORDER STATUS SUMMARY
      ==================================== */}

      <div className="flex flex-wrap gap-2 px-5 pb-5">

        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
          <FiClock />
          Pending: {safe.pending}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
          <FiTruck />
          Processing: {safe.processing}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
          <FiTruck />
          Shipped: {safe.shipped}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          <FiCheckCircle />
          Delivered: {safe.delivered}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">
          <FiXCircle />
          Cancelled: {safe.cancelled}
        </span>

      </div>

      {/* ====================================
          LATEST ORDERS
      ==================================== */}

      <div className="border-t">

        <div className="px-5 py-3 text-xs font-semibold uppercase text-gray-600">
          Latest Orders (Today)
        </div>

        {loading && !summary ? (

          <div className="px-5 pb-6 text-sm text-gray-500">
            অর্ডার লোড হচ্ছে...
          </div>

        ) : error ? (

          <div className="px-5 pb-6 text-sm text-red-600">
            অর্ডারের তথ্য পাওয়া যায়নি।
          </div>

        ) : topOrders.length === 0 ? (

          <div className="px-5 pb-6 text-sm text-gray-500">
            আজকে কোনো অর্ডার নেই।
          </div>

        ) : (

          <div className="space-y-3 px-5 pb-5">

            {topOrders.map((order) => {

              const items = order.products || [];

              const quantity = items.reduce(
                (sum, item) =>
                  sum + Number(item.quantity || 0),
                0
              );

              const firstItem = items[0] || {};

              const product =
                firstItem.product &&
                typeof firstItem.product === "object"
                  ? firstItem.product
                  : {};

              // Order snapshot data
              const firstName =
                firstItem.productName ||
                product.productName ||
                "Product";

              const firstSku =
                firstItem.sku ||
                product.sku ||
                "";

              const productImage =
                product.productImage;

              const firstImg = toImg(
                firstItem.image ||
                (Array.isArray(productImage)
                  ? productImage[0]
                  : productImage) ||
                null
              );

              const moreCount =
                Math.max(0, items.length - 1);

              const otherNames = items
                .slice(1, 4)
                .map(
                  (item) =>
                    item.productName ||
                    item.product?.productName
                )
                .filter(Boolean);

              const customerName =
                order.customer?.name ||
                "Customer";

              const customerMobile =
                order.customer?.mobile ||
                "—";

              const status =
                order.orderStatus ||
                "pending";

              return (

                <div
                  key={order._id}
                  className="flex flex-col gap-3 rounded-xl border p-4 transition hover:bg-indigo-50/20 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* PRODUCT & CUSTOMER */}

                  <div className="flex min-w-0 items-start gap-3">

                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-100">

                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt={firstName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <FiPackage className="text-gray-400" />
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-gray-900">
                        {customerName} • {customerMobile}
                      </p>

                      <p className="mt-0.5 truncate text-sm text-gray-800">

                        {firstName}

                        {firstSku && (
                          <span className="text-xs text-gray-500">
                            {" "}• {firstSku}
                          </span>
                        )}

                        {moreCount > 0 && (
                          <span className="text-xs text-gray-500">
                            {" "}+{moreCount} more
                          </span>
                        )}

                      </p>

                      {otherNames.length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          Also: {otherNames.join(", ")}
                          {items.length > 4 ? " ..." : ""}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        {fmtBDDateTime(order.createdAt)}
                        {" • "}
                        {quantity} items
                        {" • "}
                        {fmtBDT(order.totalPrice)}
                      </p>

                    </div>
                  </div>

                  {/* ORDER STATUS */}

                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                  </div>

                </div>
              );
            })}

          </div>

        )}
      </div>
    </div>
  );
}
