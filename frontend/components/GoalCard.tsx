import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
}

interface GoalCardProps {
  goal: Goal;
  onAddMoney: (goalId: string, amount: number) => void;
  onEdit?: (goalId: string) => void;
}

const getProgressColor = (progress: number, color: string) => {
  if (progress >= 0.9) return "bg-gradient-to-r from-yellow-400 to-green-400";
  return color;
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onAddMoney,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  return (
    <Card
      className="relative p-5 flex flex-col gap-3 border-2"
      style={{ borderColor: goal.color }}
    >
      <div className="flex justify-between items-start"></div>
      <div className="flex flex-col items-center gap-1">
        <div className="font-bold text-lg text-center">{goal.title}</div>
        <div className="text-xs text-muted-foreground">
          by {format(new Date(goal.targetDate), "MMM yyyy")}
        </div>
      </div>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full h-4 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress >= 0.9 ? "bg-linear-to-r from-yellow-400 to-green-400" : ""}`}
            style={{
              width: `${progress * 100}%`,
              background: progress < 0.9 ? goal.color : undefined,
            }}
          />
        </div>
        <div className="text-xs font-semibold text-center mt-1">
          रु{goal.currentAmount.toLocaleString()} / रु
          {goal.targetAmount.toLocaleString()} ({Math.round(progress * 100)}%)
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {showAdd && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 animate-fade-in">
          <div
            className="relative bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 w-full max-w-xs border border-neutral-200 dark:border-neutral-800 focus:outline-none"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Close"
              onClick={() => setShowAdd(false)}
              tabIndex={0}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
            </button>
            <div className="font-bold text-lg text-center mb-1">
              Add to Goal
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="add-amount"
                className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1"
              >
                Amount
              </label>
              <input
                id="add-amount"
                type="number"
                min="1"
                inputMode="numeric"
                autoFocus
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-1 bg-neutral-50 dark:bg-neutral-800 placeholder:text-neutral-400"
                placeholder="Enter amount (रु)"
                value={addAmount}
                onChange={(e) =>
                  setAddAmount(e.target.value.replace(/[^0-9]/g, ""))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addAmount && Number(addAmount) > 0) {
                    onAddMoney(goal.id, Number(addAmount));
                    setShowAdd(false);
                    setAddAmount("");
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-1 w-full">
                {[1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`px-3 py-1 rounded-lg border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-neutral-700 border-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-green-100 dark:hover:bg-green-900 ${addAmount === amt.toString() ? "ring-2 ring-green-400 border-green-400" : ""}`}
                    style={{ minWidth: 0, flex: "1 1 30%" }}
                    onClick={() => setAddAmount(amt.toString())}
                  >
                    रु{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
                onClick={() => {
                  onAddMoney(goal.id, Number(addAmount));
                  setShowAdd(false);

                  setAddAmount("");
                }}
                disabled={!addAmount || Number(addAmount) <= 0}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-700"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
