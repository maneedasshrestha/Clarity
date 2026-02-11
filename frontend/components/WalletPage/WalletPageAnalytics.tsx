"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import BalanceCard from "@/components/BalanceCard";
import Loader from "@/components/Loader";

const transactions = [
  {
    id: 1,
    description: "Starbucks",
    category: "Coffee",
    amount: -5.5,
    type: "expense",
    date: "2026-02-11T09:30:00",
  },
  {
    id: 2,
    description: "Salary",
    category: "Income",
    amount: 2500,
    type: "income",
    date: "2026-02-10T14:00:00",
  },
  {
    id: 3,
    description: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    type: "expense",
    date: "2026-02-09T19:30:00",
  },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "This Month", value: "month" },
];

function groupByDate(transactions: any[]) {
  const groups: { [key: string]: any[] } = {};
  transactions.forEach((tx) => {
    const dateObj = new Date(tx.date);
    const label = dateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

const WalletPageAnalytics = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let txs = transactions;

    if (filter === "expense") txs = txs.filter((t) => t.type === "expense");
    else if (filter === "income") txs = txs.filter((t) => t.type === "income");
    else if (filter === "month") {
      const now = new Date();
      txs = txs.filter(
        (t) =>
          new Date(t.date).getMonth() === now.getMonth() &&
          new Date(t.date).getFullYear() === now.getFullYear(),
      );
    }

    if (search.trim()) {
      txs = txs.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return txs;
  }, [search, filter]);

  const totalBalance = filtered.reduce((acc, t) => acc + t.amount, 0);
  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-background px-4 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
        <div className="lg:sticky lg:top-24 space-y-8">
          <BalanceCard
            label={search ? `Total for '${search}'` : "Total Balance"}
            amount={totalBalance.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            varient={totalBalance >= 0 ? "income" : "expense"}
          />

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border glassmorphism">
            <div className="text-sm text-muted-foreground mb-2">
              Transactions
            </div>
            <div className="text-3xl font-bold">{filtered.length}</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 'Coffee' or 'Salary'..."
              className="text-lg"
            />

            <div className="flex gap-3 flex-wrap">
              {FILTERS.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setFilter(chip.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    filter === chip.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {loading && <Loader />}

          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-24">
              <div className="text-xl font-semibold mb-2">
                No transactions found.
              </div>
              <div className="text-muted-foreground text-sm">
                Maybe you saved money that day? :p
              </div>
            </div>
          ) : (
            Object.entries(grouped).map(([date, txs]) => (
              <div key={date} className="space-y-4">
                {txs.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all"
                  >
                    {/* Text */}
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {tx.description}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {tx.category}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {tx.date}
                      </div>
                    </div>

                    {/* Amount */}
                    <div
                      className={`text-lg font-bold ${
                        tx.type === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}रु
                      {Math.abs(tx.amount).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPageAnalytics;
