"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const qOqData = [
  { quarter: "Q1", target: 80, achieved: 65 },
  { quarter: "Q2", target: 85, achieved: 78 },
  { quarter: "Q3", target: 90, achieved: 88 },
  { quarter: "Q4", target: 100, achieved: 95 },
];

const uomData = [
  { name: "Numeric", frequency: 45 },
  { name: "Percentage", frequency: 30 },
  { name: "Timeline", frequency: 15 },
  { name: "Zero-based", frequency: 10 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-8 mt-10 w-full">
      <div>
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
          System-wide Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-0">
          <h3 className="text-slate-300 font-medium mb-6">
            Quarter-on-Quarter Completion Trends
          </h3>

          <div className="w-full h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={qOqData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="quarter" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
                <Area
                  type="monotone"
                  dataKey="achieved"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorAchieved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-0">
          <h3 className="text-slate-300 font-medium mb-6">
            UoM Strategy Distribution
          </h3>

          <div className="w-full h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={uomData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="frequency"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}