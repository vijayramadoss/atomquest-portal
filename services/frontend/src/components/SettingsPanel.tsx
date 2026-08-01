"use client";

import { useState } from "react";
import {
  X,
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function SettingsPanel({
  open,
  onClose,
  theme,
  onToggleTheme,
}: SettingsPanelProps) {
  const { user } = useGoalStore();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(false);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card text-foreground shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Settings</h2>
              <p className="text-xs text-muted-foreground">
                Preferences &amp; account
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
          {/* ── Profile card ──────────────────────────────────────────── */}
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Profile
            </p>

            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold">
                    {user?.name || "Unknown User"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user?.email || "—"}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {user?.role || "Employee"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Appearance ────────────────────────────────────────────── */}
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Appearance
            </p>

            <div className="rounded-2xl border border-border bg-background/70 divide-y divide-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon size={16} className="text-muted-foreground" />
                  ) : (
                    <Sun size={16} className="text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">Theme</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {theme} mode active
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleTheme}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${
                    theme === "dark" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* ── Notifications ─────────────────────────────────────────── */}
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Notifications
            </p>

            <div className="rounded-2xl border border-border bg-background/70 divide-y divide-border overflow-hidden">
              {[
                {
                  label: "Email notifications",
                  description: "Receive updates via email",
                  icon: Bell,
                  value: emailNotifs,
                  onChange: setEmailNotifs,
                },
                {
                  label: "Review reminders",
                  description: "Alerts before review deadlines",
                  icon: CalendarDays,
                  value: reviewReminders,
                  onChange: setReviewReminders,
                },
                {
                  label: "Approval alerts",
                  description: "Notify when goals are approved or rejected",
                  icon: Shield,
                  value: approvalAlerts,
                  onChange: setApprovalAlerts,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => item.onChange(!item.value)}
                      className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${
                        item.value ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          item.value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Review cycle info ─────────────────────────────────────── */}
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Review Cycle
            </p>

            <div className="rounded-2xl border border-border bg-background/70 divide-y divide-border overflow-hidden">
              {[
                { label: "Financial Year", value: "FY 2026–2027" },
                { label: "Current Quarter", value: "Q1" },
                { label: "Window Status", value: "Active" },
                { label: "Goal Submission", value: "Jun 30, 2026" },
                { label: "Manager Review", value: "Jul 15, 2026" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Account actions ───────────────────────────────────────── */}
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Account
            </p>

            <div className="rounded-2xl border border-border bg-background/70 divide-y divide-border overflow-hidden">
              {[
                {
                  icon: User,
                  label: "Edit profile",
                  desc: "Update your name and details",
                },
                {
                  icon: Shield,
                  label: "Change password",
                  desc: "Keep your account secure",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-accent"
                    onClick={() =>
                      alert(
                        `${item.label} — coming soon!`
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            AtomQuest Enterprise KPI Suite · v2.0
          </p>
        </div>
      </aside>
    </>
  );
}
