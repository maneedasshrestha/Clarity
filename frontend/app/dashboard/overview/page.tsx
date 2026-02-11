const Overview = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background mt-[150] mb-[100]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Welcome back, User!</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-muted">&#60;</button>
          <span className="font-medium">February 2026</span>
          <button className="px-2 py-1 rounded bg-muted">&#62;</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Balance Card */}
        <div className="p-4 rounded-lg shadow bg-card flex flex-col items-start">
          <div className="text-lg font-semibold">Total Balance</div>
          <div className="text-3xl font-bold text-green-600">$12,500</div>
          <span className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            ⬆ 8% vs last month
          </span>
        </div>
        {/* Total Income Card */}
        <div className="p-4 rounded-lg shadow bg-card flex flex-col items-start">
          <div className="text-lg font-semibold">Total Income</div>
          <div className="text-xl font-bold text-green-700">$4,200</div>
          <span className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            ⬇ 12% vs last month
          </span>
        </div>
        {/* Total Expenses Card */}
        <div className="p-4 rounded-lg shadow bg-card flex flex-col items-start">
          <div className="text-lg font-semibold">Total Expenses</div>
          <div className="text-xl font-bold text-red-600">$2,800</div>
          <span className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            ⬆ 5% vs last month
          </span>
        </div>
      </div>

      {/* Data Visualization (Charts) */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Spending Trend Chart Placeholder */}
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-[250px]">
          Spending Trend Chart
        </div>
        {/* Category Breakdown Chart Placeholder */}
        <div className="flex-1 bg-card rounded-lg shadow p-4 min-h-[250px]">
          Category Breakdown Chart
        </div>
      </div>

      {/* Recent Transactions (Mini-List) */}
      <div className="bg-card rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold">Recent Activity</div>
          <a
            href="/dashboard/transactions"
            className="text-primary text-sm font-medium"
          >
            View All
          </a>
        </div>
        <ul className="divide-y">
          {/* Example transaction rows */}
          <li className="flex items-center py-2">
            <span className="mr-3">🍔</span>
            <div className="flex-1">
              <div className="font-medium">Starbucks</div>
              <div className="text-xs text-muted">Today</div>
            </div>
            <div className="font-semibold text-red-600">-$5.50</div>
          </li>
          <li className="flex items-center py-2">
            <span className="mr-3">💼</span>
            <div className="flex-1">
              <div className="font-medium">Salary</div>
              <div className="text-xs text-muted">Yesterday</div>
            </div>
            <div className="font-semibold text-green-600">+$2,000</div>
          </li>
          {/* ...more items... */}
        </ul>
      </div>

      {/* Floating Action Button (FAB) for Mobile */}
      <button className="md:hidden fixed bottom-6 right-6 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg z-50">
        +
      </button>
    </div>
  );
};

export default Overview;
