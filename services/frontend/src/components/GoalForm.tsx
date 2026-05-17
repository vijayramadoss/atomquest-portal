"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";

import { useGoalStore } from "@/store/useGoalStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type UnitOfMeasurement =
  | "Numeric"
  | "%"
  | "Timeline"
  | "Zero-based";

interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UnitOfMeasurement;
  target: string;
  weightage: number;
}

export default function GoalForm() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      thrustArea: "Revenue",
      title: "Increase Q1 Sales",
      description: "Target enterprise accounts",
      uom: "Numeric",
      target: "500000",
      weightage: 50,
    },
    {
      id: "2",
      thrustArea: "Productivity",
      title: "Automate reports",
      description: "Deploy automated BI",
      uom: "Timeline",
      target: "2026-07-01",
      weightage: 50,
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const {
    submitGoalSheet,
    saveDraftGoalSheet,
  } = useGoalStore();

  const { addToast } = useToast();

  const totalWeightage = goals.reduce(
    (sum, g) => sum + Number(g.weightage),
    0
  );

  const validateGoals = () => {
    if (totalWeightage !== 100) {
      return "Total weightage must equal exactly 100%.";
    }

    if (goals.some((g) => Number(g.weightage) < 10)) {
      return "Minimum weightage per goal is 10%.";
    }

    if (goals.length > 8) {
      return "Maximum 8 goals allowed.";
    }

    if (
      goals.some(
        (g) =>
          !g.title.trim() ||
          !g.description.trim() ||
          !g.thrustArea.trim()
      )
    ) {
      return "All goal fields are required.";
    }

    return null;
  };

  const addGoal = () => {
    if (goals.length >= 8) {
      setError("Maximum of 8 goals allowed.");
      return;
    }

    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        thrustArea: "",
        title: "",
        description: "",
        uom: "Numeric",
        target: "",
        weightage: 10,
      },
    ]);

    setError(null);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
    setError(null);
  };

  const updateGoal = (
    id: string,
    field: keyof Goal,
    value: any
  ) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, [field]: value } : g
      )
    );
  };

  // SAVE DRAFT
  const saveDraft = async () => {
    const validationError = validateGoals();

    if (validationError) {
      setError(validationError);
      addToast(validationError, "error");
      return;
    }

    setError(null);
    setSavingDraft(true);

    try {
      await saveDraftGoalSheet(
        "2026",
        goals
      );

      addToast(
        "Draft Goal Sheet Saved Successfully",
        "success"
      );
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSavingDraft(false);
    }
  };

  // SUBMIT GOALS
  const submitGoals = async () => {
    const validationError = validateGoals();

    if (validationError) {
      setError(validationError);
      addToast(validationError, "error");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await submitGoalSheet(
        "2026",
        goals
      );

      addToast(
        "Goal Sheet Successfully Submitted!",
        "success"
      );
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-card border-border shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-6">
        <div>
          <CardTitle className="text-xl text-foreground">
            Draft Goal Sheet
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Maximum 8 goals. Total weightage must be exactly 100%.
          </p>
        </div>

        <div
          className={`text-lg font-bold px-4 py-2 rounded-lg border shadow-inner ${
            totalWeightage === 100
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {totalWeightage}% Total
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 text-rose-400 p-4 rounded-lg border border-rose-500/20">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              {error}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:bg-white/[0.07]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-slate-200">
                  Goal #{index + 1}
                </h3>

                <button
                  onClick={() => removeGoal(goal.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Thrust Area
                  </label>

                  <input
                    type="text"
                    value={goal.thrustArea}
                    onChange={(e) =>
                      updateGoal(
                        goal.id,
                        "thrustArea",
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Sales"
                  />
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Title
                  </label>

                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) =>
                      updateGoal(
                        goal.id,
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Goal title"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Weightage (%)
                  </label>

                  <input
                    type="number"
                    min="10"
                    value={goal.weightage}
                    onChange={(e) =>
                      updateGoal(
                        goal.id,
                        "weightage",
                        Number(e.target.value)
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1 lg:col-span-3">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Description
                  </label>

                  <input
                    type="text"
                    value={goal.description}
                    onChange={(e) =>
                      updateGoal(
                        goal.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Detailed description of expected outcome"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      UoM
                    </label>

                    <select
                      value={goal.uom}
                      onChange={(e) =>
                        updateGoal(
                          goal.id,
                          "uom",
                          e.target.value as UnitOfMeasurement
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="Numeric">
                        Numeric
                      </option>

                      <option value="%">%</option>

                      <option value="Timeline">
                        Timeline
                      </option>

                      <option value="Zero-based">
                        Zero-based
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Target
                    </label>

                    <input
                      type={
                        goal.uom === "Timeline"
                          ? "date"
                          : "text"
                      }
                      value={goal.target}
                      onChange={(e) =>
                        updateGoal(
                          goal.id,
                          "target",
                          e.target.value
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-border mt-8">
          <Button
            variant="outline"
            onClick={addGoal}
            disabled={goals.length >= 8}
            className="gap-2 font-semibold"
          >
            <Plus size={16} />
            Add Goal
          </Button>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={saveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              {savingDraft
                ? "Saving..."
                : "Save Draft"}
            </Button>

            <Button
              onClick={submitGoals}
              disabled={submitting}
              className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            >
              {submitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}

              {submitting
                ? "Submitting..."
                : "Submit Goals"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}