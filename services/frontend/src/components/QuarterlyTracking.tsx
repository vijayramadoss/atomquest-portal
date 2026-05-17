"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Quarterly Achievement Tracking
          </h2>

          <p className="text-sm text-slate-400">
            Update actuals against your planned values
          </p>
        </div>

        <div className="flex gap-2">
          {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeQuarter === q
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {localGoals.length === 0 ? (
          <div className="text-sm text-slate-400 bg-[#0b1120] border border-slate-800 rounded-lg p-4">
            No goals found yet. Create and submit goals first.
          </div>
        ) : (
          localGoals.map((g) => (
            <div
              key={g._id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0b1120] border border-slate-800 rounded-lg p-4"
            >
              <div className="md:col-span-4">
                <h4 className="text-sm font-semibold text-slate-200">
                  {g.title}
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  Target:{" "}
                  {g.uom === "Timeline"
                    ? g.targetDate || g.target
                    : g.target}{" "}
                  ({g.uom})
                </p>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-slate-500 mb-1 block">
                  Actual Achievement
                </label>

                <input
                  type="text"
                  value={g.achievement}
                  onChange={(e) =>
                    updateAchievement(g._id, e.target.value)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder={
                    g.uom === "Timeline"
                      ? "Not applicable"
                      : "Enter value"
                  }
                  disabled={g.uom === "Timeline"}
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-slate-500 mb-1 block">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="On Track">On Track</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="md:col-span-2 text-right">
                <label className="text-xs text-slate-500 mb-1 block">
                  Progress
                </label>

                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`text-lg font-bold ${
                      g.progressScore >= 100
                        ? "text-emerald-400"
                        : "text-blue-400"
                    }`}
                  >
                    {g.progressScore}%
                  </span>

                  {g.progressScore >= 100 ? (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400"
                    />
                  ) : (
                    <AlertCircle
                      size={16}
                      className="text-blue-400"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveQuarterCheckIn}
          disabled={saving || localGoals.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 transition-colors"
        >
          <Save size={16} />

          {saving
            ? "Saving..."
            : `Save ${activeQuarter} Check-in`}
        </button>
      </div>
    </div>
  );
}