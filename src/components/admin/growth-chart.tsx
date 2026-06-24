"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailySession {
  date: string;
  count: number;
}

interface GrowthChartProps {
  data?: DailySession[];
}

/**
 * Fill gaps in sparse daily data — ensures every day in the last 30 days
 * has a data point (0 if no sessions) so the chart renders a continuous line.
 */
function fillDailyGaps(data: DailySession[]): DailySession[] {
  if (data.length === 0) {
    // No data at all — generate 30 days of zeros so the chart still renders axes
    const result: DailySession[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    return result;
  }

  const map = new Map<string, number>();
  for (const d of data) {
    const key = d.date.slice(0, 10); // normalize to YYYY-MM-DD
    map.set(key, (map.get(key) ?? 0) + d.count);
  }

  const result: DailySession[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) ?? 0 });
  }

  return result;
}

export function GrowthChart({ data = [] }: GrowthChartProps) {
  const filled = fillDailyGaps(data);

  const chartData = filled.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sessions: d.count,
  }));

  const maxCount = Math.max(...filled.map((d) => d.count), 1);
  const yMax = Math.ceil(maxCount * 1.2) || 10;
  const step = Math.max(1, Math.ceil(yMax / 5));
  const ticks = Array.from({ length: 6 }, (_, i) => step * i).filter((v) => !isNaN(v));

  return (
    <div className="h-105 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 10, left: -10 }}
        >
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5450d8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5450d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#eef0f4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#272727", fontSize: 12, fontFamily: "Inter" }}
            interval={Math.max(0, Math.floor(chartData.length / 7) - 1)}
          />
          <YAxis
            ticks={ticks}
            domain={[0, yMax]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#272727", fontSize: 14, fontFamily: "Inter" }}
          />
          <Tooltip
            cursor={{ stroke: "#5450d8", strokeDasharray: "4 4" }}
            contentStyle={{
              backgroundColor: "#5450d8",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontFamily: "Inter",
            }}
            labelStyle={{ color: "#e5e5ef", fontWeight: 600 }}
            itemStyle={{ color: "white" }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#5450d8"
            strokeWidth={3}
            fill="url(#sessionsFill)"
            name="Sessions"
            activeDot={{ r: 5, fill: "#5450d8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
