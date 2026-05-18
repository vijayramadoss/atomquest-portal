"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type UnitOfMeasurement = "Numeric" | "%" | "Timeline" | "Zero-based";

interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UnitOfMeasurement;
  target: string;
  weightage: number;
}

const emptyGoal = (): Goal => ({
  id: crypto.randomUUID(),
  thrustArea: "",
  title: "",
  description: "",
  uom: "Numeric",
  target: "",
  weightage: 10,
});

export default function GoalForm() {
  const [goals, setGoals] = useState<Goal[]>([emptyGoal()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const { submitGoalSheet, saveDraftGoalSheet } = useGoalStore();
  const { addToast } = useToast();

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);

  const validateGoals = () => {
    if (totalWeightage !== 100) return "Total weightage must equal exactly 100%.";
    if (goals.some((g) => Number(g.weightage) < 10)) return "Minimum weightage per goal is 10%.";
    if (goals.length > 8) return "Maximum 8 goals allowed.";
    if (goals.some((g) => !g.title.trim() || !g.description.trim() || !g.thrustArea.trim() || !g.target.trim())) {
      return "Please complete all goal fields before saving.";
    }
    return null;
  };

  const addGoal = () => {
    if (goals.length >= 8) {
      setError("Maximum of 8 goals allowed.");
      return;
    }

    setGoals([...goals, emptyGoal()]);
    setError(null);
  };

  const removeGoal = (id: string) => {
    if (goals.length === 1) {
      setGoals([emptyGoal()]);
      return;
    }

    setGoals(goals.filter((g) => g.id !== id));
    setError(null);
  };

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

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
      await saveDraftGoalSheet("2026", goals);
      addToast("Draft saved successfully", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSavingDraft(false);
    }
  };

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
      await submitGoalSheet("2026", goals);
      addToast("Goal sheet submitted successfully", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="aq-card overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Goal Sheet
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Add measurable goals for the current cycle. Total weightage must be exactly 100%.
            </p>
          </div>

          <div
            className={`rounded-2xl border px-4 py-2 text-sm font-bold ${
              totalWeightage === 100
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {totalWeightage}% allocated
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle size={18} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Goal {index + 1}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Define objective, target, and measurement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeGoal(goal.id)}
                  className="rounded-xl p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="aq-label">Thrust area</label>
                  <input
                    type="text"
                    value={goal.thrustArea}
                    onChange={(e) => updateGoal(goal.id, "thrustArea", e.target.value)}
                    className="aq-input"
                    placeholder="e.g. Revenue growth"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="aq-label">Goal title</label>
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => updateGoal(goal.id, "title", e.target.value)}
                    className="aq-input"
                    placeholder="Enter a clear goal title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="aq-label">Weightage</label>
                  <input
                    type="number"
                    min="10"
                    value={goal.weightage}
                    onChange={(e) => updateGoal(goal.id, "weightage", Number(e.target.value))}
                    className="aq-input"
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="aq-label">Description</label>
                  <input
                    type="text"
                    value={goal.description}
                    onChange={(e) => updateGoal(goal.id, "description", e.target.value)}
                    className="aq-input"
                    placeholder="Describe the expected business outcome"
                  />
                </div>

                <div className="space-y-2">
                  <label className="aq-label">Measurement</label>
                  <select
                    value={goal.uom}
                    onChange={(e) => updateGoal(goal.id, "uom", e.target.value as UnitOfMeasurement)}
                    className="aq-input"
                  >
                    <option value="Numeric">Numeric</option>
                    <option value="%">Percentage</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="aq-label">Target</label>
                  <input
                    type={goal.uom === "Timeline" ? "date" : "text"}
                    value={goal.target}
                    onChange={(e) => updateGoal(goal.id, "target", e.target.value)}
                    className="aq-input"
                    placeholder={goal.uom === "Timeline" ? "Select date" : "Enter target value"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={addGoal} disabled={goals.length >= 8} className="gap-2">
            <Plus size={16} />
            Add Goal
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="gap-2" onClick={saveDraft} disabled={savingDraft}>
              {savingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {savingDraft ? "Saving..." : "Save Draft"}
            </Button>

            <Button onClick={submitGoals} disabled={submitting} className="gap-2 px-6">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Submitting..." : "Submit Goals"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}