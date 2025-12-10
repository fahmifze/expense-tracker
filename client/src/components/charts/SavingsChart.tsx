import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SavingsChartProps {
  income: number;
  expenses: number;
  isLoading?: boolean;
}

export default function SavingsChart({ income, expenses, isLoading }: SavingsChartProps) {
  if (isLoading) {
    return (
      <div className="h-48 bg-gray-100 animate-pulse rounded-full mx-auto w-48" />
    );
  }

  const savings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const data = [
    { name: 'Savings', value: savings, color: '#10B981' },
    { name: 'Expenses', value: expenses, color: '#EF4444' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(value);
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          {savingsRate.toFixed(0)}%
        </span>
        <span className="text-sm text-gray-500">Saved</span>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Savings: {formatCurrency(savings)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Expenses: {formatCurrency(expenses)}</span>
        </div>
      </div>
    </div>
  );
}
