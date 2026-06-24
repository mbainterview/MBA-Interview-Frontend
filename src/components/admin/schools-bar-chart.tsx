"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SchoolBarDatum {
  school: string;
  interviews: number;
}

const DATA: SchoolBarDatum[] = [
  { school: "Harvard", interviews: 9000 },
  { school: "Stanford", interviews: 10500 },
  { school: "Wharton", interviews: 4800 },
  { school: "INSEAD", interviews: 8800 },
  { school: "Booth", interviews: 13800 },
  { school: "Kellogg", interviews: 10200 },
];

export function SchoolsBarChart() {
  return (
    <div className="h-105 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={DATA}
          margin={{ top: 20, right: 20, bottom: 10, left: -10 }}
          barCategoryGap="35%"
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="#eef0f4"
            vertical={false}
          />
          <XAxis
            dataKey="school"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#272727", fontSize: 14, fontFamily: "Inter" }}
          />
          <YAxis
            ticks={[0, 3000, 6000, 9000, 12000, 15000]}
            domain={[0, 15000]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#272727", fontSize: 14, fontFamily: "Inter" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(84,80,216,0.08)" }}
            contentStyle={{
              backgroundColor: "#5450d8",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontFamily: "Inter",
            }}
            itemStyle={{ color: "white" }}
            labelStyle={{ color: "#e5e5ef" }}
          />
          <Bar
            dataKey="interviews"
            fill="#5450d8"
            radius={[8, 8, 0, 0]}
            name="Interviews"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
