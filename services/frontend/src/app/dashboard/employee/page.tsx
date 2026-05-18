"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import GoalForm from "@/components/GoalForm";
import QuarterlyTracking from "@/components/QuarterlyTracking";
import { Card } from "@/components/ui/card";

const activity = [
  {
    title: "Goal draft updated",
    description: "Your latest goal sheet changes are saved locally.",
    icon: FileText,
  },
  {
    title: "Q1 check-in window active",
    description: "Update your actual achievement before the review deadline.",
    icon: Clock3,
  },
  {
    title: "Manager review pending",
    description: "Submitted goals will appear in your manager’s review queue.",
    icon: AlertCircle,
  },
];

const deadlines = [
  {
    label: "Goal submission",
    date: "Jun 30",
    status: "Open",
  },
  {
    label: "Q1 check-in",
    date: "Jul 10",
    status: "Active",
  },
  {
    label: "Manager review",
    date: "Jul 15",
    status: "Upcoming",
  },
];

export default function EmployeeDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Employee Workspace
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Objective Hub
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Draft goals, submit your goal sheet, and track quarter-wise achievement
              against planned outcomes.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-fit sm:flex-row">
            <div className="rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cycle
              </p>
              <p className="mt-1 text-sm font-bold">FY 2026–2027</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Window
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Q1 Active
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Goal Allocation",
              value: "100%",
              note: "Required total weightage",
              icon: Target,
              color: "text-blue-500",
            },
            {
              title: "Quarter Cycle",
              value: "Q1",
              note: "Current tracking phase",
              icon: CalendarDays,
              color: "text-emerald-500",
            },
            {
              title: "Progress Updates",
              value: "4",
              note: "Q1–Q4 check-ins",
              icon: TrendingUp,
              color: "text-purple-500",
            },
            {
              title: "Review Status",
              value: "Live",
              note: "Synced with manager dashboard",
              icon: CheckCircle2,
              color: "text-orange-500",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight">
                      {item.value}
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-background ${item.color}`}
                  >
                    <Icon size={26} />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-6">
            <GoalForm />
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight">
                  Activity Timeline
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent actions and workflow updates
                </p>
              </div>

              <div className="space-y-4">
                {activity.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-2xl border border-border bg-background/60 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight">
                  Upcoming Deadlines
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Key checkpoints for this review cycle
                </p>
              </div>

              <div className="space-y-3">
                {deadlines.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="dashboard-insights" data-section="insights">
          <QuarterlyTracking />
        </section>
      </div>
    </DashboardLayout>
  );
}