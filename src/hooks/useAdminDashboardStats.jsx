
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = (
  import.meta.env.VITE_APP_SERVER_URL ||
  "http://localhost:5000/"
).replace(/\/+$/, "");

const initialStats = {
  totalProducts: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalSales: 0,
};

export default function useAdminDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(initialStats);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("access-token") ||
        localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/admin/dashboard/stats`,
        {
          withCredentials: true,
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const json = response.data;

      if (json?.success === false) {
        throw new Error(
          json.message || "Failed to fetch stats"
        );
      }

      const data = json?.data || json || {};

      setStats({
        totalProducts: Number(data.totalProducts || 0),
        totalUsers: Number(data.totalUsers || 0),
        totalOrders: Number(data.totalOrders || 0),
        totalSales: Number(data.totalSales || 0),
      });

    } catch (err) {
      console.error(
        "Dashboard stats error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard stats"
      );

      setStats(initialStats);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    loading,
    stats,
    error,
    refresh: fetchStats,
  };
}
