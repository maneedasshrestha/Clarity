import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreVertical, Plus } from "lucide-react";

interface Goal {
  id: string;
  emoji: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO string
  color: string; // e.g. "#4F46E5"
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
  onEdit,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  const progressBarColor =
    progress >= 0.9
      ? "bg-gradient-to-r from-yellow-400 to-green-400"
      : goal.color;

  return (
    <Card
      className="relative p-5 flex flex-col gap-3 border-2"
      style={{ borderColor: goal.color }}
    >
      <div className="flex justify-between items-start">
        <div
          className="rounded-xl p-3 text-4xl"
          style={{ background: goal.color + "22" }}
        >
          {goal.emoji}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit?.(goal.id)}
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="font-bold text-lg text-center">{goal.title}</div>
        <div className="text-xs text-muted-foreground">
          by {format(new Date(goal.targetDate), "MMM yyyy")}
        </div>
      </div>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full h-4 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress >= 0.9 ? "bg-gradient-to-r from-yellow-400 to-green-400" : ""}`}
            style={{
              width: `${progress * 100}%`,
              background: progress < 0.9 ? goal.color : undefined,
            }}
          />
        </div>
        <div className="text-xs font-semibold text-center mt-1">
          ${goal.currentAmount.toLocaleString()} / $
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
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-lg flex flex-col gap-2 min-w-[220px]">
            <div className="font-semibold text-sm mb-1">Add to fund</div>
            <input
              type="number"
              min="1"
              className="border rounded px-2 py-1 mb-2"
              placeholder="Amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
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
                variant="ghost"
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
