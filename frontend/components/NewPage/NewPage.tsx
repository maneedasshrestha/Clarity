"use client";
import React, { useState, useRef, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
  { label: "Food", icon: "🍔" },
  { label: "Transport", icon: "🚌" },
  { label: "Rent", icon: "🏠" },
];
const INCOME_CATEGORIES = [{ label: "Salary", icon: "💲" }];

const NewPage = () => {
  const [mode, setMode] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCategory("");
  }, [mode]);

  const categories =
    mode === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const filteredCategories = categorySearch
    ? categories.filter((c) =>
        c.label.toLowerCase().includes(categorySearch.toLowerCase()),
      )
    : categories;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if ((val.match(/\./g) || []).length > 1) return;
    if (!/^\d*(\.\d{0,2})?$/.test(val)) return;
    setAmount(val);
  };

  const handleSave = () => {
    if (!amount || Number(amount) === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [amount]);

  const activeColor = mode === "expense" ? "bg-red-500" : "bg-green-500";
  const saveBtnColor =
    mode === "expense"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-green-500 hover:bg-green-600";

  const parsedDate = date ? new Date(date) : undefined;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 px-4 md:px-8 lg:px-16 py-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="lg:sticky lg:top-24 space-y-12 w-full max-w-100 lg:w-100">
            <div className="flex justify-start">
              <div className="inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-1">
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    mode === "expense"
                      ? activeColor + " text-white shadow"
                      : "text-neutral-700 dark:text-neutral-200"
                  }`}
                  onClick={() => setMode("expense")}
                >
                  Expense
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    mode === "income"
                      ? activeColor + " text-white shadow"
                      : "text-neutral-700 dark:text-neutral-200"
                  }`}
                  onClick={() => setMode("income")}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <span className="text-5xl lg:text-6xl font-bold text-neutral-400 mr-3">
                  रु
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  className="text-5xl lg:text-7xl font-bold bg-transparent outline-none w-56 lg:w-72 border-b-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-400 transition-colors"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 lg:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-8">
            <div>
              <div className="flex gap-2 mb-2">
                <button
                  className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-800"
                  onClick={() =>
                    setDate(format(subDays(new Date(), 1), "yyyy-MM-dd"))
                  }
                >
                  Yesterday
                </button>
                <button
                  className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-800"
                  onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}
                >
                  Today
                </button>
              </div>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? (
                      format(new Date(date), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={(selected) => {
                      if (selected) {
                        setDate(format(selected, "yyyy-MM-dd"));
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Category</label>
              <input
                type="text"
                placeholder="Search category..."
                className="w-full px-3 py-2 mb-4 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 min-w-0">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all min-w-22.5 ${
                      category === cat.label
                        ? "bg-blue-600 text-white border-blue-600 scale-105"
                        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="What was this for? (optional)"
              className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div>
              <button
                className="text-sm text-blue-600 dark:text-blue-400"
                onClick={() => setShowAdvanced(!showAdvanced)}
                type="button"
              >
                {showAdvanced ? "v" : ">"} More Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                    />
                    Repeat monthly?
                  </label>
                </div>
              )}
            </div>
            <button
              disabled={!amount || Number(amount) === 0 || loading}
              onClick={handleSave}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white transition-all ${saveBtnColor} disabled:opacity-50`}
            >
              {loading ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-neutral-950  border-neutral-200 dark:border-neutral-800 p-4">
        <div className="max-w-6xl mx-auto"></div>
      </div>
    </div>
  );
};

export default NewPage;
