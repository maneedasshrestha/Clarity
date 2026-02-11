interface CardProps {
  label: string;
  amount: number | string;
  varient?: "net" | "income" | "expense";
}

const varientClasses = {
  net: "text-blue-700",
  income: "text-green-700",
  expense: "text-red-700",
};

const BalanceCard = ({ label, amount, varient = "net" }: CardProps) => {
  return (
    <div className="p-8 rounded-lg shadow bg-card flex flex-col items-start glassmorphism">
      <div className="text-lg font-semibold">{label}</div>
      <div
        className={`text-3xl text-red- font-bold ${varientClasses[varient]}`}
      >
        रु {amount}
      </div>
    </div>
  );
};

export default BalanceCard;
