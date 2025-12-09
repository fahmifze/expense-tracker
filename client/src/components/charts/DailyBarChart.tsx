import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DailyTotal } from '../../types/expense.types';

interface DailyBarChartProps {
  data: DailyTotal[];
  currency?: string;
}

export default function DailyBarChart({ data, currency = 'USD' }: DailyBarChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data.map((item) => ({
    name: item.day.toString(),
    total: Number(item.total),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No daily data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          interval={4}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          tickFormatter={(value) => `$${value}`}
          width={40}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Spent']}
          labelFormatter={(label) => `Day ${label}`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
