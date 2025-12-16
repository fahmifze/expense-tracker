import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { StockCandle } from '../../types/stock.types';

interface StockChartProps {
  candles: StockCandle[];
  isLoading?: boolean;
  height?: number;
  showVolume?: boolean;
}

export default function StockChart({
  candles,
  isLoading = false,
  height = 400,
}: StockChartProps) {
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    if (!candles || candles.length === 0) return [];

    return candles.map((candle) => ({
      date: new Date(candle.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: new Date(candle.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      close: candle.close,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      volume: candle.volume,
    }));
  }, [candles]);

  const { minPrice, maxPrice, priceChange, priceChangePercent, isPositive } = useMemo(() => {
    if (chartData.length === 0) {
      return { minPrice: 0, maxPrice: 0, priceChange: 0, priceChangePercent: 0, isPositive: true };
    }

    const prices = chartData.map((d) => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    const change = last - first;
    const changePercent = (change / first) * 100;

    return {
      minPrice: min * 0.99,
      maxPrice: max * 1.01,
      priceChange: change,
      priceChangePercent: changePercent,
      isPositive: change >= 0,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <div
        className={`rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} animate-pulse`}
        style={{ height }}
      />
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center ${
          isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
        }`}
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  const gradientId = `stockGradient-${isPositive ? 'green' : 'red'}`;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const fillColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div>
      {/* Price Change Summary */}
      <div className="flex items-center gap-4 mb-4">
        <span
          className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        >
          {isPositive ? '+' : ''}${priceChange.toFixed(2)}
        </span>
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
        </span>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Past {chartData.length} days
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#374151' : '#e5e7eb'}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
            dy={10}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: 600 }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                close: 'Close',
                open: 'Open',
                high: 'High',
                low: 'Low',
              };
              return [`$${value.toFixed(2)}`, labels[name] || name];
            }}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return '';
            }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 6,
              fill: strokeColor,
              stroke: isDark ? '#1f2937' : '#ffffff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
