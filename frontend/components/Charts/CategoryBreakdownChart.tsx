import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryBreakdownData {
  name: string;
  value: number;
  color?: string;
}

interface CategoryBreakdownChartProps {
  data?: CategoryBreakdownData[];
}

const defaultData: CategoryBreakdownData[] = [
  { name: "Food", value: 400, color: "#a5b4fc" },
  { name: "Rent", value: 700, color: "#34d399" },
  { name: "Utilities", value: 200, color: "#fbbf24" },
  { name: "Entertainment", value: 150, color: "#fb7185" },
  { name: "Transport", value: 120, color: "#38bdf8" },
];

const COLORS = ["#a5b4fc", "#34d399", "#fbbf24", "#fb7185", "#38bdf8"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded shadow p-2">
        <div className="text-xs text-gray-400">{payload[0].name}</div>
        <div className="font-semibold text-indigo-300">
          रु{payload[0].value.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data: propData,
}) => {
  // Use provided data or fallback to default data
  const data = propData && propData.length > 0 ? propData : defaultData;

  // If we have real data with colors, use them; otherwise use default colors
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <div>
      <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
        Category Breakdown
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-60 text-gray-500">
          <div className="text-center">
            <div className="text-sm">No expense data available</div>
            <div className="text-xs mt-1">
              Start adding transactions to see breakdown
            </div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#a5b4fc"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              align="center"
              wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryBreakdownChart;
