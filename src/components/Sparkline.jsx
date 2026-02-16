import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, color = '#3b82f6', height = 32 }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div className="sparkline-container" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
