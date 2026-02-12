"use client";
import React, { useState, useMemo, useEffect } from "react";
import { GoalCard } from "@/components/GoalCard";
import Confetti from "@/components/Confetti";
import ColorPicker from "@/components/ColorPicker";
import Loader from "@/components/Loader";
import { apiClient, Goal } from "@/lib/api";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

import { format, differenceInDays, parse, addYears } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const GoalPageLayout = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [confettiGoalId, setConfettiGoalId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: format(new Date(), "yyyy-MM-dd"),
    color: "#3B82F6",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning",
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getGoals();
      if (response.success) {
        setGoals(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch goals");
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      setError("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (goalId: string, amount: number) => {
    // 1. Snapshot for potential rollback
    const originalGoals = [...goals];

    try {
      // 2. Find the goal and calculate optimistic values
      const goalToUpdate = goals.find((g) => g.id === goalId);
      if (!goalToUpdate) return;

      const currentAmount = Number(goalToUpdate.current_amount || 0);
      const targetAmount = Number(goalToUpdate.target_amount || 0);
      const newAmount = currentAmount + amount;

      // 3. Side effects based on optimistic update (immediate feedback)
      const wasCompleted = targetAmount > 0 && currentAmount >= targetAmount;
      const isCompleted = targetAmount > 0 && newAmount >= targetAmount;

      if (!wasCompleted && isCompleted) {
        setConfettiGoalId(goalId);
        setTimeout(() => setConfettiGoalId(null), 2000);
        showToast("Congratulations! Goal completed!", "success");
      } else {
        showToast("Money added to goal successfully!", "success");
      }

      // 4. Update state optimistically
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId ? { ...g, current_amount: newAmount } : g,
        ),
      );

      // 5. API Call & Reconciliation
      const response = await apiClient.addMoneyToGoal(goalId, amount);
      if (response.success && response.data) {
        const updated = response.data;
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              return { ...g, ...updated };
            }
            return g;
          }),
        );
      } else {
        throw new Error(response.message || "Failed to update goal");
      }
    } catch (error) {
      console.error("Failed to add money to goal:", error);
      showToast("Failed to add money. Changes rolled back.", "error");
      // 6. Rollback state to original
      setGoals(originalGoals);
    }
  };

  const handleEdit = (goalId: string) => {
    showToast("Edit functionality coming soon!", "warning");
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount) return;

    try {
      const goalData = {
        title: newGoal.title,
        target_amount: newGoal.targetAmount,
        target_date: newGoal.targetDate,
        color: newGoal.color,
      };

      const response = await apiClient.createGoal(goalData);
      if (response.success && response.data) {
        setGoals((prev) => {
          const exists = prev.some((g) => g.id === response.data!.id);
          if (exists) return prev;
          return [...prev, response.data!];
        });
        setCreating(false);
        setNewGoal({
          title: "",
          targetAmount: 0,
          currentAmount: 0,
          targetDate: format(new Date(), "yyyy-MM-dd"),
          color: "#3B82F6",
        });
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
      showToast("Failed to create goal. Please try again.", "error");
    }
  };

  const sortedGoals = useMemo(() => {
    return [...goals].sort(
      (a, b) =>
        (b.current_amount || 0) / (b.target_amount || 1) -
        (a.current_amount || 0) / (a.target_amount || 1),
    );
  }, [goals]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen dark:bg-neutral-950 px-2 sm:px-4 lg:px-12 py-8 pb-28">
        <div className="max-w-full sm:max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchGoals}
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
    <div className="min-h-screen dark:bg-neutral-950 px-2 sm:px-4 lg:px-12 py-8 pb-28">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border flex items-center justify-between min-w-80 animate-in slide-in-from-right duration-300 ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                : toast.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-current hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="max-w-full sm:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-12">
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="lg:sticky lg:top-24 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vision Board</h1>
            <p className="text-sm text-muted-foreground">
              Track your dreams. Build your future.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 glassmorphism p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="text-sm text-muted-foreground mb-2">
              Total Goals
            </div>
            <div className="text-3xl font-bold">{goals.length}</div>
          </div>

          <button
            className="hidden lg:block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all"
            onClick={() => setCreating(true)}
          >
            + Create New Goal
          </button>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="space-y-10 lg:space-y-10">
          {/* Mobile Header */}
          <div className="flex justify-between items-center lg:hidden">
            <h1 className="text-2xl font-bold">Vision Board</h1>
            <button
              className="bg-blue-600 text-white ml-5 px-4 py-2 rounded-lg font-semibold"
              onClick={() => setCreating(true)}
            >
              + New
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {sortedGoals.map((goal, index) => {
              const progress = Math.min(
                ((goal.current_amount || 0) / (goal.target_amount || 1)) * 100,
                100,
              ).toFixed(0);

              return (
                <div key={goal.id || index} className="relative">
                  <GoalCard
                    goal={{
                      id: goal.id,
                      title: goal.title,
                      targetAmount: goal.target_amount,
                      currentAmount: goal.current_amount || 0,
                      targetDate: goal.target_date,
                      color: goal.color || "#3B82F6",
                    }}
                    onAddMoney={handleAddMoney}
                    onEdit={handleEdit}
                  />

                  {confettiGoalId === goal.id && (
                    <Confetti key={`confetti-${goal.id}`} active />
                  )}

                  <div className="mt-2 text-xs text-center font-medium text-muted-foreground">
                    {progress}% complete
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div
                key="empty-state"
                className="col-span-full flex flex-col items-center justify-center py-12"
              >
                <div className="text-xl font-semibold mb-2">No goals yet</div>
                <div className="text-muted-foreground text-sm mb-4">
                  Start by creating your first goal!
                </div>
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={() => setCreating(true)}
                >
                  + Create Your First Goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {creating && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 w-full lg:w-105 rounded-t-2xl lg:rounded-2xl p-6 shadow-2xl flex flex-col gap-4 mb-24 lg:mb-0">
            <div className="flex gap-3 items-center">
              <input
                className="flex-1 px-3 py-2 rounded-lg border"
                placeholder="Goal Title"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>

            <input
              type="number"
              className="px-3 py-2 rounded-lg border"
              placeholder="Target Amount"
              value={newGoal.targetAmount}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  targetAmount: Number(e.target.value),
                })
              }
              min={1}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Target Date
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded border text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                  onClick={() =>
                    setNewGoal({
                      ...newGoal,
                      targetDate: format(addYears(new Date(), 1), "yyyy-MM-dd"),
                    })
                  }
                >
                  1 Year from Today
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded border text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                  onClick={() =>
                    setNewGoal({
                      ...newGoal,
                      targetDate: format(addYears(new Date(), 5), "yyyy-MM-dd"),
                    })
                  }
                >
                  5 Years from Today
                </button>
              </div>
              <div className="w-fit">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border w-full text-left"
                    >
                      {(() => {
                        try {
                          if (!newGoal.targetDate) return "Pick a date";
                          const parsedDate = parse(
                            newGoal.targetDate,
                            "yyyy-MM-dd",
                            new Date(),
                          );
                          if (isNaN(parsedDate.getTime())) return "Pick a date";
                          return format(parsedDate, "PPP");
                        } catch {
                          return "Pick a date";
                        }
                      })()}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={
                        newGoal.targetDate
                          ? parse(newGoal.targetDate, "yyyy-MM-dd", new Date())
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setNewGoal({
                            ...newGoal,
                            targetDate: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <ColorPicker
              value={newGoal.color}
              onChange={(color) => setNewGoal({ ...newGoal, color })}
            />

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold"
                onClick={handleCreateGoal}
                disabled={!newGoal.title || !newGoal.targetAmount}
              >
                Create
              </button>
              <button
                className="flex-1 bg-neutral-200 dark:bg-neutral-700 py-2 rounded-xl font-semibold"
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalPageLayout;
