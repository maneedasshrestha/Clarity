interface CardProps {
  label: string;
  amount: number | string;
  varient?: "net" | "income" | "expense";
  previousAmount?: number;
  showTrend?: boolean;
}

const varientClasses = {
  net: {
    amount: "text-blue-700",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    trend: "text-blue-600",
  },
  income: {
    amount: "text-green-700",
    bg: "bg-green-50 dark:bg-green-900/20",
    trend: "text-green-600",
  },
  expense: {
    amount: "text-red-700",
    bg: "bg-red-50 dark:bg-red-900/20",
    trend: "text-red-600",
  },
};

const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ne-NP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(numAmount));
};

const calculateTrendPercentage = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const BalanceCard = ({
  label,
  amount,
  varient = "net",
  previousAmount,
  showTrend = false,
}: CardProps) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const classes = varientClasses[varient];

  const trendPercentage =
    showTrend && previousAmount !== undefined
      ? calculateTrendPercentage(numAmount, previousAmount)
      : null;

  const isPositiveTrend = trendPercentage ? trendPercentage > 0 : null;
  const isNegativeTrend = trendPercentage ? trendPercentage < 0 : null;

  const displayTrendAsPositive =
    varient === "expense" ? isNegativeTrend : isPositiveTrend;
  const displayTrendAsNegative =
    varient === "expense" ? isPositiveTrend : isNegativeTrend;

  return (
    <div
      className={`p-6 rounded-lg shadow bg-card flex flex-col items-start glassmorphism ${classes.bg} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </div>
      </div>

      <div className={`text-2xl font-bold mb-1 ${classes.amount}`}>
        रु {formatCurrency(numAmount)}
      </div>

      {varient === "net" && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {numAmount >= 0 ? "Positive cash flow" : "Negative cash flow"}
        </div>
      )}

      {varient === "income" && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Total earnings this month
        </div>
      )}

      {varient === "expense" && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Total spending this month
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
