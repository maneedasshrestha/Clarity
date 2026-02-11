const recentTransactions = () => {
  return (
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
      </ul>
    </div>
  );
};

export default recentTransactions;
