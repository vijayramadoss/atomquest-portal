"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  X,
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";

import { useGoalStore } from "@/store/useGoalStore";

interface InsightsPanelProps {
  open: boolean;
  onClose: () => void;
}

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"] as const;
type Quarter = (typeof QUARTER_LABELS)[number];

const STATUS_COLORS: Record<string, string> = {
  Completed: "#10b981",
  "On Track": "#3b82f6",
  "Not Started": "#6b7280",
};

function computeProgressScore(goal: any, qKey: string): number {
  const q = goal[qKey] || {};
  if (goal.uom === "Timeline") return q.status === "Completed" ? 100 : 0;
  if (goal.uom === "Zero-based") return Number(q.achievement) === 0 ? 100 : 0;
  const target = Number(goal.target);
  const actual = Number(q.achievement || 0);
  return target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
}

export default function InsightsPanel({ open, onClose }: InsightsPanelProps) {
  const { goals } = useGoalStore();

  const backendGoals = useMemo(() => {
    if (!goals) return [];
    if (Array.isArray(goals)) return goals;
    if (Array.isArray((goals as any).goals)) return (goals as any).goals;
    return [];
  }, [goals]);

  // ─── Derived analytics ────────────────────────────────────────────────────

  // Quarter-by-quarter average achievement %
  const qoqData = useMemo(() => {
    return QUARTER_LABELS.map((q) => {
      const qKey = q.toLowerCase();
      if (backendGoals.length === 0) return { quarter: q, achievement: 0 };
      const avgScore =
        backendGoals.reduce(
          (sum: number, g: any) => sum + computeProgressScore(g, qKey),
          0
        ) / backendGoals.length;
      return { quarter: q, achievement: Math.round(avgScore) };
    });
  }, [backendGoals]);

  // Status distribution for the latest active quarter (Q1 by default)
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Completed: 0,
      "On Track": 0,
      "Not Started": 0,
    };
    backendGoals.forEach((g: any) => {
      const status = g.q1?.status || "Not Started";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [backendGoals]);

  // Per-goal weightage vs achievement (Q1)
  const goalBreakdown = useMemo((): {
    name: string;
    weightage: number;
    achievement: number;
  }[] => {
    return backendGoals.map((g: any) => ({
      name:
        g.title.length > 18 ? g.title.substring(0, 18) + "…" : g.title,
      weightage: Number(g.weightage),
      achievement: computeProgressScore(g, "q1"),
    }));
  }, [backendGoals]);

  // Summary stats
  const totalGoals = backendGoals.length;
  const completedGoals = backendGoals.filter(
    (g: any) => g.q1?.status === "Completed"
  ).length;
  const onTrackGoals = backendGoals.filter(
    (g: any) => g.q1?.status === "On Track"
  ).length;
  const avgQ1Achievement =
    totalGoals > 0
      ? Math.round(
          backendGoals.reduce(
            (sum: number, g: any) => sum + computeProgressScore(g, "q1"),
            0
          ) / totalGoals
        )
      : 0;

  const radialData = [{ name: "Avg", value: avgQ1Achievement, fill: "#3b82f6" }];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-card text-foreground shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Performance Insights
              </h2>
              <p className="text-xs text-muted-foreground">
                Your goal analytics · FY 2026–2027
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background transition hover:bg-accent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {totalGoals === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-background/60 py-20 text-center">
              <Clock3 size={40} className="text-muted-foreground" />
              <h3 className="text-xl font-semibold">No goals submitted yet</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Create and submit your goals to start seeing performance insights
                here.
              </p>
            </div>
          ) : (
            <>
              {/* ── Summary KPI cards ─────────────────────────────────────── */}
              <section>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Q1 Snapshot
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    {
                      label: "Total Goals",
                      value: totalGoals,
                      icon: Target,
                      color: "text-blue-500",
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Completed",
                      value: completedGoals,
                      icon: CheckCircle2,
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      label: "On Track",
                      value: onTrackGoals,
                      icon: TrendingUp,
                      color: "text-purple-500",
                      bg: "bg-purple-500/10",
                    },
                    {
                      label: "Not Started",
                      value: totalGoals - completedGoals - onTrackGoals,
                      icon: AlertCircle,
                      color: "text-orange-500",
                      bg: "bg-orange-500/10",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border bg-background/70 p-4"
                      >
                        <div
                          className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                        >
                          <Icon size={16} />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── Radial avg + QoQ chart ─────────────────────────────────── */}
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
                {/* Radial gauge */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background/70 px-6 py-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Avg Q1 Score
                  </p>
                  <div className="relative h-40 w-40">
                    <RadialBarChart
                      width={160}
                      height={160}
                      cx={80}
                      cy={80}
                      innerRadius={50}
                      outerRadius={75}
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: "#1e293b" }}
                        dataKey="value"
                        cornerRadius={8}
                        angleAxisId={0}
                      />
                    </RadialBarChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold">{avgQ1Achievement}%</p>
                      <p className="text-xs text-muted-foreground">complete</p>
                    </div>
                  </div>
                </div>

                {/* Quarter-on-quarter area chart */}
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Quarter-on-Quarter Avg Achievement
                  </p>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart
                      data={qoqData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="insightGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="quarter"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          color: "#fff",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(v: any) => [`${v}%`, "Achievement"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="achievement"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#insightGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ── Status distribution ────────────────────────────────────── */}
              {statusDistribution.length > 0 && (
                <section>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Goal Status (Q1)
                  </p>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart
                        data={statusDistribution}
                        margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            color: "#fff",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                          formatter={(v: any) => [`${v} goal(s)`, "Count"]}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                          {statusDistribution.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                STATUS_COLORS[entry.name] || "#6b7280"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* ── Per-goal breakdown ─────────────────────────────────────── */}
              <section>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Goal-wise Achievement vs Weightage (Q1)
                </p>
                <div className="space-y-3">
                  {goalBreakdown.map((g) => (
                    <div
                      key={g.name}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{g.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{g.weightage}% weight</span>
                          <span
                            className={`font-bold ${
                              g.achievement >= 100
                                ? "text-emerald-500"
                                : g.achievement >= 50
                                ? "text-blue-500"
                                : "text-orange-500"
                            }`}
                          >
                            {g.achievement}% done
                          </span>
                        </div>
                      </div>
                      {/* Achievement bar */}
                      <div className="mt-3 h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            g.achievement >= 100
                              ? "bg-emerald-500"
                              : g.achievement >= 50
                              ? "bg-blue-500"
                              : "bg-orange-500"
                          }`}
                          style={{ width: `${Math.min(g.achievement, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
