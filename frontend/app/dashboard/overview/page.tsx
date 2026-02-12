"use client";
import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdownChart from "@/components/Charts/CategoryBreakdownChart";
import SpendingTrendChart from "@/components/Charts/SpendingTrendChart";
import Loader from "@/components/Loader";
import MonthPickerButton from "@/components/MonthPicker/MonthPicker";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/api";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface OverviewData {
  totals: {
    income: number;
    expenses: number;
    net_amount: number;
  };
  previous_totals?: {
    income: number;
    expenses: number;
    net_amount: number;
  };
  category_breakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  spending_trend: Array<{
    day: number;
    spending: number;
  }>;
}

const Overview = () => {
  const [user, setUser] = useState<User | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOverviewData();
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchOverviewData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchOverviewData();
      }
    };

    const handleTransactionAdded = () => {
      if (user) {
        fetchOverviewData();
      }
    };

    const checkRefreshNeeded = () => {
      if (localStorage.getItem("dataRefreshNeeded") === "true" && user) {
        localStorage.removeItem("dataRefreshNeeded");
        fetchOverviewData();
      }
    };

    checkRefreshNeeded();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("transactionAdded", handleTransactionAdded);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("transactionAdded", handleTransactionAdded);
    };
  }, [user]);

  useEffect(() => {
    if (user && pathname === "/dashboard/overview") {
      fetchOverviewData();
    }
  }, [pathname, user]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getOverview({
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success && response.data) {
        setOverviewData(response.data);
      } else {
        throw new Error("Failed to fetch overview data");
      }
    } catch (err) {
      console.error("Error fetching overview data:", err);
      setError("Failed to load overview data. Please try again.");
      setOverviewData({
        totals: { income: 0, expenses: 0, net_amount: 0 },
        category_breakdown: [],
        spending_trend: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  if (!user) return <Loader />;

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">
          Welcome back, {user.user_metadata?.name || "User"}!
        </div>
        <div className="flex items-center gap-2">
          <MonthPickerButton
            onMonthChange={handleMonthChange}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={fetchOverviewData}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <BalanceCard
          label="Net Amount"
          amount={overviewData?.totals?.net_amount || 0}
          varient="net"
          previousAmount={overviewData?.previous_totals?.net_amount}
          showTrend={true}
        />
        <BalanceCard
          label="Income"
          amount={overviewData?.totals?.income || 0}
          varient="income"
          previousAmount={overviewData?.previous_totals?.income}
          showTrend={true}
        />
        <BalanceCard
          label="Expenses"
          amount={overviewData?.totals?.expenses || 0}
          varient="expense"
          previousAmount={overviewData?.previous_totals?.expenses}
          showTrend={true}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5 glassmorphism">
          <SpendingTrendChart
            data={overviewData?.spending_trend || []}
            month={selectedMonth}
            year={selectedYear}
          />
        </div>
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5 glassmorphism">
          <CategoryBreakdownChart
            data={overviewData?.category_breakdown || []}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
