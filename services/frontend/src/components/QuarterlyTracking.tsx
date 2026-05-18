"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  TrendingUp,
} from "lucide-react";

import { useGoalStore } from "@/store/useGoalStore";

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export default function QuarterlyTracking() {
  const { token, goals, fetchGoals } = useGoalStore();

  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q1");
  const [localGoals, setLocalGoals] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchGoals();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backendGoals = useMemo(() => {
    if (!goals) return [];

    if (Array.isArray(goals)) return goals;

    if (Array.isArray((goals as any).goals)) {
      return (goals as any).goals;
    }

    return [];
  }, [goals]);

  useEffect(() => {
    const quarterKey = activeQuarter.toLowerCase();

    const mapped = backendGoals.map((goal: any) => {
      const q = goal[quarterKey] || {};

      const achievement =
        goal.uom === "Timeline"
          ? ""
          : q.achievement !== undefined
          ? String(q.achievement)
          : "";

      let progressScore = 0;

      if (goal.uom === "Numeric" || goal.uom === "%") {
        const target = Number(goal.target);
        const actual = Number(q.achievement || 0);

        progressScore =
          target > 0
            ? Math.min(100, Math.round((actual / target) * 100))
            : 0;
      }

      if (goal.uom === "Zero-based") {
        progressScore = Number(q.achievement) === 0 ? 100 : 0;
      }

      if (goal.uom === "Timeline") {
        progressScore = q.status === "Completed" ? 100 : 0;
      }

      return {
        ...goal,
        achievement,
        status: q.status || "Not Started",
        progressScore,
      };
    });

    setLocalGoals(mapped);
  }, [backendGoals, activeQuarter]);

  const updateAchievement = (id: string, value: string) => {
    setLocalGoals((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;

        let newScore = g.progressScore;

        if (
          (g.uom === "Numeric" || g.uom === "%") &&
          Number(g.target) > 0
        ) {
          newScore = Math.min(
            100,
            Math.round((Number(value) / Number(g.target)) * 100)
          );
        }

        if (g.uom === "Zero-based") {
          newScore = Number(value) === 0 ? 100 : 0;
        }

        return {
          ...g,
          achievement: value,
          progressScore: newScore,
        };
      })
    );
  };

  const updateStatus = (
    id: string,
    status: "Not Started" | "On Track" | "Completed"
  ) => {
    setLocalGoals((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;

        let newScore = g.progressScore;

        if (g.uom === "Timeline") {
          newScore = status === "Completed" ? 100 : 0;
        }

        return {
          ...g,
          status,
          progressScore: newScore,
        };
      })
    );
  };

  const saveQuarterCheckIn = async () => {
    if (!token) {
      setMessage("No token found. Please logout and login again.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const quarter = activeQuarter.toLowerCase();

      for (const goal of localGoals) {
        const achievement =
          goal.uom === "Timeline"
            ? goal.status === "Completed"
              ? 1
              : 0
            : Number(goal.achievement || 0);

        const res = await fetch(
          `https://atomquest-backend-7u7u.onrender.com/api/goals/${goal._id}/tracking/${quarter}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "x-hackathon-bypass": "true",
            },
            body: JSON.stringify({
              achievement,
              status: goal.status,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || `Failed to save ${activeQuarter}`
          );
        }
      }

      await fetchGoals();

      setMessage(`${activeQuarter} check-in saved successfully.`);
    } catch (error: any) {
      setMessage(error.message || "Failed to save check-in.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">
              Quarterly Insights
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            Achievement Tracking
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Update actual achievements against your planned goals and track
            quarter-wise performance progression.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeQuarter === q
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "border border-border bg-background hover:bg-accent"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {message}
        </div>
      )}

      <div className="mt-8 space-y-5">
        {localGoals.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/60 p-8 text-center">
            <Clock3 size={32} className="mx-auto text-muted-foreground" />

            <h3 className="mt-4 text-lg font-semibold">
              No goals available yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create and submit goals before starting quarterly tracking.
            </p>
          </div>
        ) : (
          localGoals.map((g) => (
            <div
              key={g._id}
              className="rounded-3xl border border-border bg-background/60 p-5 transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="xl:max-w-[28%]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {g.title}
                    </h3>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {g.uom}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {g.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Target:</span>{" "}
                      <span className="font-semibold">
                        {g.uom === "Timeline"
                          ? g.targetDate || g.target
                          : g.target}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
                      <span className="text-muted-foreground">
                        Weightage:
                      </span>{" "}
                      <span className="font-semibold">
                        {g.weightage}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actual Achievement
                    </label>

                    <input
                      type="text"
                      value={g.achievement}
                      onChange={(e) =>
                        updateAchievement(g._id, e.target.value)
                      }
                      className="aq-input"
                      placeholder={
                        g.uom === "Timeline"
                          ? "Not required"
                          : "Enter actual value"
                      }
                      disabled={g.uom === "Timeline"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>

                    <select
                      value={g.status}
                      onChange={(e) =>
                        updateStatus(
                          g._id,
                          e.target.value as
                            | "Not Started"
                            | "On Track"
                            | "Completed"
                        )
                      }
                      className="aq-input"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="On Track">On Track</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Progress
                    </label>

                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold tracking-tight">
                            {g.progressScore}%
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Completion score
                          </p>
                        </div>

                        {g.progressScore >= 100 ? (
                          <CheckCircle2
                            size={26}
                            className="text-emerald-500"
                          />
                        ) : (
                          <AlertCircle
                            size={26}
                            className="text-blue-500"
                          />
                        )}
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${
                            g.progressScore >= 100
                              ? "bg-emerald-500"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(g.progressScore, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveQuarterCheckIn}
          disabled={saving || localGoals.length === 0}
          className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving
            ? "Saving..."
            : `Save ${activeQuarter} Check-in`}
        </button>
      </div>
    </section>
  );
}