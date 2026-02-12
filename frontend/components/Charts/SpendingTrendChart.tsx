import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Label,
} from "recharts";

interface SpendingTrendData {
  day: number;
  period?: number;
  spending: number;
}

interface SpendingTrendChartProps {
  data?: SpendingTrendData[];
  month?: number;
  year?: number;
}

const getMockData = () => {
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  // Only generate data up to current date for current month
  const currentDay = now.getDate();
  const maxDays = daysInMonth;

  return Array.from({ length: Math.min(currentDay, maxDays) }, (_, i) => ({
    day: i + 1,
    spending: Math.floor(Math.random() * 200),
  }));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded shadow p-2">
        <div className="text-xs text-gray-400">Day {label}</div>
        <div className="font-semibold text-indigo-300">
          रु{payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data: propData,
  month,
  year,
}) => {
  const rawData = propData && propData.length > 0 ? propData : getMockData();

  const data = rawData.map((item) => ({
    day: item.day ?? (item as any).period ?? 0,
    spending: item.spending,
  }));

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = month
    ? monthNames[month - 1]
    : monthNames[new Date().getMonth()];
  const currentYear = year || new Date().getFullYear();

  return (
    <div>
      <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
        Spending Trend - {currentMonth} {currentYear}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          >
            <Label
              value="DAY"
              offset={-5}
              position="insideBottom"
              style={{ fontSize: 12, fill: "#6b7280" }}
            />
          </XAxis>
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          >
            <Label
              value="Spending (रु)"
              angle={-90}
              position="insideLeft"
              style={{ fontSize: 12, fill: "#6b7280" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#4169e1"
            strokeWidth={3}
            fill="url(#colorSpending)"
            dot={{ stroke: "#4169e1", strokeWidth: 2, r: 4, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrendChart;
