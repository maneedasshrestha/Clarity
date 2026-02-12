"use client";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import BalanceCard from "@/components/BalanceCard";
import Loader from "@/components/Loader";
import { apiClient, Transaction } from "@/lib/api";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "This Month", value: "month" },
];

function groupByDate(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};
  transactions.forEach((tx) => {
    const dateObj = new Date(tx.created_at);
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
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getTransactions({});
      if (response.success) {
        setTransactions(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let txs = transactions;

    if (filter === "expense") txs = txs.filter((t) => t.type === "expense");
    else if (filter === "income") txs = txs.filter((t) => t.type === "income");
    else if (filter === "month") {
      const now = new Date();
      txs = txs.filter(
        (t) =>
          new Date(t.created_at).getMonth() === now.getMonth() &&
          new Date(t.created_at).getFullYear() === now.getFullYear(),
      );
    }

    if (search.trim()) {
      txs = txs.filter(
        (t) =>
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.category_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return txs;
  }, [search, filter, transactions]);

  const totalBalance = filtered.reduce((acc, t) => acc + t.amount, 0);
  const grouped = groupByDate(filtered);

  if (error) {
    return (
      <div className="min-h-screen bg-background px-4 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {txs.map((tx: Transaction) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all"
                  >
                    {/* Text */}
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {tx.description || "No description"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {tx.category_name}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {new Date(tx.created_at).toLocaleDateString()}
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
