"use client";
import BalanceCard from "@/components/BalanceCard";
import MonthPickerButton from "@/components/MonthPicker/MonthPicker";

const Overview = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background  ">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Welcome back, User!</div>
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
        {/* Spending Trend Chart Placeholder */}
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5">
          Spending Trend Chart
        </div>
        {/* Category Breakdown Chart Placeholder */}
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-62.5">
          Category Breakdown Chart
        </div>
      </div>
    </div>
  );
};

export default Overview;
