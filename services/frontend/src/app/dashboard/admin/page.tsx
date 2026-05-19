"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LockOpen,
  RefreshCcw,
  Send,
  ShieldAlert,
  Target,
  TrendingUp,
  Unplug,
  Users,
  UserCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://atomquest-backend-7u7u.onrender.com";

type AdminTab =
  | "shared"
  | "reports"
  | "unlock"
  | "escalations"
  | "assignments";

const trendData = [
  { quarter: "Q1", completion: 64, target: 78 },
  { quarter: "Q2", completion: 72, target: 82 },
  { quarter: "Q3", completion: 86, target: 90 },
  { quarter: "Q4", completion: 91, target: 96 },
];

const activityFeed = [
  { title: "Shared KPI pushed to Sales team", time: "12 min ago", type: "KPI" },
  { title: "Manager approved Q1 goal sheet", time: "38 min ago", type: "Approval" },
  { title: "Escalation reminder generated", time: "1 hr ago", type: "Escalation" },
  { title: "CSV report exported by Admin", time: "Today", type: "Report" },
];

const upcomingDeadlines = [
  { title: "Q1 Check-in Review", date: "Jul 10", status: "Upcoming" },
  { title: "Manager Approval Window", date: "Jul 15", status: "Pending" },
  { title: "Escalation Review", date: "Jul 20", status: "Scheduled" },
];

export default function AdminDashboard() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("shared");
  const [analytics, setAnalytics] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [sharedGoal, setSharedGoal] = useState({
    department: "",
    year: 2026,
    thrustArea: "",
    title: "",
    description: "",
    uom: "Numeric",
    target: "",
    weightage: "",
  });

  const [escalations, setEscalations] = useState({
    q1Month: 7,
    q2Month: 10,
    q3Month: 1,
    q4Month: 4,
    penaltyEnabled: true,
    reminderDaysBefore: 5,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [analyticsRes, sheetsRes, escRes, managersRes, employeesRes] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/analytics`, { headers: authHeaders }),
          fetch(`${API_URL}/api/admin/goalsheets`, { headers: authHeaders }),
          fetch(`${API_URL}/api/admin/escalations`, { headers: authHeaders }),
          fetch(`${API_URL}/api/admin/managers`, { headers: authHeaders }),
          fetch(`${API_URL}/api/admin/employees`, { headers: authHeaders }),
        ]);

      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      if (!sheetsRes.ok) throw new Error("Failed to fetch goal sheets");

      const analyticsData = await analyticsRes.json();
      const sheetsData = await sheetsRes.json();

      setAnalytics(analyticsData);
      setSheets(sheetsData.sheets || []);

      if (managersRes.ok) {
        const managersData = await managersRes.json();
        setManagers(managersData.managers || []);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData.employees || []);
      }

      if (escRes.ok) {
        const escData = await escRes.json();
        setEscalations(escData.escalationSettings);
      }
    } catch (error: any) {
      addToast(error.message || "Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSharedGoal = async () => {
    try {
      if (
        !sharedGoal.department.trim() ||
        !sharedGoal.thrustArea.trim() ||
        !sharedGoal.title.trim() ||
        !sharedGoal.description.trim() ||
        !sharedGoal.target ||
        !sharedGoal.weightage
      ) {
        addToast("Please complete all shared goal fields", "error");
        return;
      }

      setLoading(true);

      const payload = {
        ...sharedGoal,
        target: Number(sharedGoal.target),
        weightage: Number(sharedGoal.weightage),
      };

      const res = await fetch(`${API_URL}/api/admin/shared-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create shared goal");
      }

      addToast("Shared goal pushed successfully", "success");

      setSharedGoal({
        department: "",
        year: 2026,
        thrustArea: "",
        title: "",
        description: "",
        uom: "Numeric",
        target: "",
        weightage: "",
      });

      await fetchAdminData();
    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const unlockSheet = async (sheetId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/goalsheets/${sheetId}/unlock`, {
        method: "PUT",
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to unlock sheet");
      }

      addToast("Goal sheet unlocked successfully", "success");
      await fetchAdminData();
    } catch (error: any) {
      addToast(error.message, "error");
    }
  };

  const assignEmployeeToManager = async (
    employeeId: string,
    managerId: string
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/employees/${employeeId}/assign-manager`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ managerId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign employee");
      }

      addToast(
        managerId
          ? "Employee assigned to manager successfully"
          : "Manager assignment removed successfully",
        "success"
      );

      await fetchAdminData();
    } catch (error: any) {
      addToast(error.message || "Assignment failed", "error");
    }
  };

  const downloadReport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/goals.csv`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "goals-report.csv";
      a.click();

      window.URL.revokeObjectURL(url);
      addToast("Report downloaded successfully", "success");
    } catch (error: any) {
      addToast(error.message, "error");
    }
  };

  const saveEscalations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/escalations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(escalations),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save escalation settings");
      }

      addToast("Escalation settings saved", "success");
    } catch (error: any) {
      addToast(error.message, "error");
    }
  };

  const summary = analytics?.summary;

  const stats = [
    {
      title: "Employees",
      value: summary?.employeesCount ?? 0,
      icon: Users,
      color: "text-blue-500",
      pill: "Active workforce",
    },
    {
      title: "Total Goals",
      value: summary?.goalsCount ?? 0,
      icon: Target,
      color: "text-emerald-500",
      pill: "Tracked KPIs",
    },
    {
      title: "Goal Sheets",
      value: summary?.sheetsCount ?? 0,
      icon: FileSpreadsheet,
      color: "text-orange-500",
      pill: "Review cycles",
    },
    {
      title: "Managers",
      value: summary?.managersCount ?? 0,
      icon: ShieldAlert,
      color: "text-purple-500",
      pill: "Approvers",
    },
  ];

  const cards = [
    {
      id: "shared" as AdminTab,
      title: "Shared Goals",
      desc: "Push strategic KPIs to departments and employees.",
      icon: Users,
    },
    {
      id: "reports" as AdminTab,
      title: "Reports",
      desc: "Export quarterly and yearly analytics reports.",
      icon: FileSpreadsheet,
    },
    {
      id: "unlock" as AdminTab,
      title: "Unlock Sheets",
      desc: "Override locked or approved review cycles.",
      icon: LockOpen,
    },
    {
      id: "escalations" as AdminTab,
      title: "Escalations",
      desc: "Configure reminders and delayed review actions.",
      icon: Unplug,
    },
    {
      id: "assignments" as AdminTab,
      title: "Assignments",
      desc: "Assign employees to managers.",
      icon: UserCheck,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              HR Governance Console
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Admin Governance
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Manage organization-wide KPIs, approvals, analytics, reporting,
              role assignments, and review governance.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-semibold shadow-sm hover:bg-accent disabled:opacity-60 sm:w-fit"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.title}
                    </p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight">
                      {item.value}
                    </h2>

                    <span className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {item.pill}
                    </span>
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
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Quarterly Completion Trend
                </h2>
                <p className="text-sm text-muted-foreground">
                  Target vs actual completion movement across review cycles.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
                Improving
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="completion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="completion"
                    stroke="#2563eb"
                    fill="url(#completion)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest governance events
                </p>
              </div>

              <Activity size={20} className="text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />

                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.time}</span>
                      <span>•</span>
                      <span>{item.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <Card
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/80"
                }`}
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    active ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-xl font-bold tracking-tight">
                  {item.title}
                </h3>

                <p
                  className={`mt-3 text-sm leading-6 ${
                    active ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            {activeTab === "shared" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Push Shared Goal
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create and distribute organization-wide KPI objectives.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <input
                    placeholder="Department or All"
                    value={sharedGoal.department}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, department: e.target.value })
                    }
                    className="aq-input"
                  />

                  <input
                    placeholder="Thrust Area"
                    value={sharedGoal.thrustArea}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, thrustArea: e.target.value })
                    }
                    className="aq-input"
                  />

                  <input
                    placeholder="Goal Title"
                    value={sharedGoal.title}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, title: e.target.value })
                    }
                    className="aq-input"
                  />

                  <input
                    placeholder="Describe expected KPI outcome"
                    value={sharedGoal.description}
                    onChange={(e) =>
                      setSharedGoal({
                        ...sharedGoal,
                        description: e.target.value,
                      })
                    }
                    className="aq-input md:col-span-2"
                  />

                  <select
                    value={sharedGoal.uom}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, uom: e.target.value })
                    }
                    className="aq-input"
                  >
                    <option value="Numeric">Numeric</option>
                    <option value="%">Percentage</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Target Value"
                    value={sharedGoal.target}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, target: e.target.value })
                    }
                    className="aq-input"
                  />

                  <input
                    type="number"
                    placeholder="Weightage %"
                    value={sharedGoal.weightage}
                    onChange={(e) =>
                      setSharedGoal({ ...sharedGoal, weightage: e.target.value })
                    }
                    className="aq-input"
                  />
                </div>

                <button
                  onClick={createSharedGoal}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-fit"
                >
                  <Send size={18} />
                  Push Shared Goal
                </button>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Data Reports
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Export employee goals, statuses, quarter updates, and performance metrics.
                </p>

                <button
                  onClick={downloadReport}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-fit"
                >
                  <Download size={18} />
                  Download CSV Report
                </button>
              </div>
            )}

            {activeTab === "unlock" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Master Unlock
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlock employee goal sheets for rework or admin correction.
                </p>

                <div className="mt-6 space-y-3">
                  {sheets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No goal sheets available.
                    </p>
                  ) : (
                    sheets.slice(0, 6).map((sheet: any) => (
                      <div
                        key={sheet._id}
                        className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-semibold">
                            {sheet.employeeId?.name || "Unknown Employee"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sheet.employeeId?.email || "No email"} •{" "}
                            {sheet.status}
                          </p>
                        </div>

                        <button
                          onClick={() => unlockSheet(sheet._id)}
                          disabled={sheet.status === "Unlocked by Admin"}
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-accent disabled:opacity-50"
                        >
                          <LockOpen size={16} />
                          Unlock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "escalations" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Escalation Controls
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure check-in windows, reminders, and penalty behavior.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(
                    [
                      "q1Month",
                      "q2Month",
                      "q3Month",
                      "q4Month",
                      "reminderDaysBefore",
                    ] as const
                  ).map((key) => (
                    <div key={key}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {key}
                      </label>
                      <input
                        type="number"
                        value={Number(escalations[key])}
                        onChange={(e) =>
                          setEscalations({
                            ...escalations,
                            [key]: Number(e.target.value),
                          })
                        }
                        className="aq-input"
                      />
                    </div>
                  ))}

                  <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={escalations.penaltyEnabled}
                      onChange={(e) =>
                        setEscalations({
                          ...escalations,
                          penaltyEnabled: e.target.checked,
                        })
                      }
                    />
                    Penalty Enabled
                  </label>
                </div>

                <button
                  onClick={saveEscalations}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-fit"
                >
                  <CheckCircle2 size={18} />
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "assignments" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Employee Assignments
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Assign employees to their respective reporting managers.
                </p>

                <div className="mt-6 space-y-4">
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No employees found.
                    </p>
                  ) : (
                    employees.map((employee) => (
                      <div
                        key={employee._id}
                        className="flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{employee.name}</p>

                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>

                          <p className="mt-1 text-xs text-primary">
                            Current Manager:{" "}
                            {employee.managerId?.name || "Not Assigned"}
                          </p>
                        </div>

                        <select
                          className="aq-input min-w-[240px]"
                          value={employee.managerId?._id || ""}
                          onChange={(e) =>
                            assignEmployeeToManager(employee._id, e.target.value)
                          }
                        >
                          <option value="">No Manager</option>

                          {managers.map((manager) => (
                            <option key={manager._id} value={manager._id}>
                              {manager.name} — {manager.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                  Upcoming Deadlines
                </h2>
                <CalendarClock size={20} className="text-muted-foreground" />
              </div>

              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                  Governance Health
                </h2>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Approval Progress</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[78%] rounded-full bg-blue-600" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Goal Completion</span>
                    <span className="font-semibold">64%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[64%] rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle size={18} />
                  <p>
                    3 review cycles need attention before the next escalation window.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}