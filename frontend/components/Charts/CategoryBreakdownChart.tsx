import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Food", value: 400 },
  { name: "Rent", value: 700 },
  { name: "Utilities", value: 200 },
  { name: "Entertainment", value: 150 },
  { name: "Transport", value: 120 },
];

const COLORS = ["#a5b4fc", "#34d399", "#fbbf24", "#fb7185", "#38bdf8"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded shadow p-2">
        <div className="text-xs text-gray-400">{payload[0].name}</div>
        <div className="font-semibold text-indigo-300">
          रु{payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

const CategoryBreakdownChart = () => (
  <div>
    <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
      Category Breakdown
    </div>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#a5b4fc"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
  </div>
);

export default CategoryBreakdownChart;
