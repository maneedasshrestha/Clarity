"use client";
import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdownChart from "@/components/Charts/CategoryBreakdownChart";
import SpendingTrendChart from "@/components/Charts/SpendingTrendChart";
import Loader from "@/components/Loader";
import MonthPickerButton from "@/components/MonthPicker/MonthPicker";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const Overview = () => {
  const [user, setUser] = useState<User | null>(null);

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

  if (!user) return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background  ">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">
          Welcome back, {user.user_metadata?.name || "Sun Dawg"}!
        </div>
        <div className="flex items-center">
          <MonthPickerButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <BalanceCard label="Net Amount" amount={10000} varient="net" />
        <BalanceCard label="Income" amount={10000} varient="income" />
        <BalanceCard label="Expenses" amount={10000} varient="expense" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5 glassmorphism">
          <SpendingTrendChart />
        </div>
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5 glassmorphism">
          <CategoryBreakdownChart />
        </div>
      </div>
    </div>
  );
};

export default Overview;
