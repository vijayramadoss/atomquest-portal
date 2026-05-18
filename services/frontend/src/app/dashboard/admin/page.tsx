"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileSpreadsheet,
  Unplug,
  ShieldAlert,
  RefreshCw,
  Download,
  LockOpen,
  Send,
  Save,
} from "lucide-react";

import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://atomquest-backend-7u7u.onrender.com";

type AdminTab = "shared" | "reports" | "unlock" | "escalations";

export default function AdminDashboard() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("shared");
  const [analytics, setAnalytics] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [sharedGoal, setSharedGoal] = useState({
    department: "All",
    year: 2026,
    thrustArea: "Strategic KPI",
    title: "Improve Department KPI",
    description: "Shared KPI pushed by Admin/HR",
    uom: "Numeric",
    target: 100,
    weightage: 10,
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

      const [analyticsRes, sheetsRes, escRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics`, {
          headers: authHeaders,
        }),
        fetch(`${API_URL}/api/admin/goalsheets`, {
          headers: authHeaders,
        }),
        fetch(`${API_URL}/api/admin/escalations`, {
          headers: authHeaders,
        }),
      ]);

      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      if (!sheetsRes.ok) throw new Error("Failed to fetch goal sheets");

      const analyticsData = await analyticsRes.json();
      const sheetsData = await sheetsRes.json();

      setAnalytics(analyticsData);
      setSheets(sheetsData.sheets || []);

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
      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/shared-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(sharedGoal),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create shared goal");
      }

      addToast("Shared goal pushed successfully", "success");
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

      addToast("GoalSheet unlocked successfully", "success");
      await fetchAdminData();
    } catch (error: any) {
      addToast(error.message, "error");
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

  const cards = [
    {
      id: "shared" as AdminTab,
      title: "Shared Goals",
      desc: "Push departmental KPIs vertically down to employees.",
      icon: Users,
    },
    {
      id: "reports" as AdminTab,
      title: "Data Reports",
      desc: "Export quarterly target vs actual metrics via CSV.",
      icon: FileSpreadsheet,
    },
    {
      id: "unlock" as AdminTab,
      title: "Master Unlock",
      desc: "Admin override to unlock approved/rejected GoalSheets.",
      icon: ShieldAlert,
    },
    {
      id: "escalations" as AdminTab,
      title: "Escalations",
      desc: "Configure check-in windows and reminders.",
      icon: Unplug,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 mb-16">
        <header className="mb-10 border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 mb-2 tracking-tight">
              Admin & HR Governance
            </h1>
            <p className="text-muted-foreground text-sm">
              System-wide Settings, KPIs, Reports, and Governance Controls
            </p>
          </div>

          <Button variant="outline" onClick={fetchAdminData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Card
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-6 hover:bg-accent/40 transition-all hover:scale-[1.02] group cursor-pointer border-border flex flex-col gap-4 shadow-sm ${
                  isActive ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform w-fit inner-shadow">
                  <Icon size={24} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 border-border bg-card">
          {activeTab === "shared" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Shared Goals</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.department}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, department: e.target.value })
                  }
                  placeholder="Department or All"
                />

                <input
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.thrustArea}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, thrustArea: e.target.value })
                  }
                  placeholder="Thrust Area"
                />

                <input
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.title}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, title: e.target.value })
                  }
                  placeholder="Goal Title"
                />

                <input
                  className="bg-background border border-border rounded-lg px-3 py-2 md:col-span-2"
                  value={sharedGoal.description}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, description: e.target.value })
                  }
                  placeholder="Description"
                />

                <select
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.uom}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, uom: e.target.value })
                  }
                >
                  <option value="Numeric">Numeric</option>
                  <option value="%">%</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Zero-based">Zero-based</option>
                </select>

                <input
                  type="number"
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.target}
                  onChange={(e) =>
                    setSharedGoal({ ...sharedGoal, target: Number(e.target.value) })
                  }
                  placeholder="Target"
                />

                <input
                  type="number"
                  className="bg-background border border-border rounded-lg px-3 py-2"
                  value={sharedGoal.weightage}
                  onChange={(e) =>
                    setSharedGoal({
                      ...sharedGoal,
                      weightage: Number(e.target.value),
                    })
                  }
                  placeholder="Weightage"
                />
              </div>

              <Button onClick={createSharedGoal}>
                <Send size={16} className="mr-2" />
                Push Shared Goal
              </Button>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Data Reports</h2>
              <p className="text-sm text-muted-foreground">
                Export all employee goals, sheet statuses, quarter achievements, and comments as CSV.
              </p>

              <Button onClick={downloadReport}>
                <Download size={16} className="mr-2" />
                Download Goals CSV
              </Button>
            </div>
          )}

          {activeTab === "unlock" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Master Unlock</h2>

              <div className="space-y-3">
                {sheets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No GoalSheets found.</p>
                ) : (
                  sheets.map((sheet: any) => (
                    <div
                      key={sheet._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-background p-4"
                    >
                      <div>
                        <div className="font-semibold">
                          {sheet.employeeId?.name || "Unknown Employee"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sheet.employeeId?.email} • {sheet.employeeId?.department || "N/A"}
                        </div>
                        <div className="text-xs mt-1">
                          Year {sheet.year} • Status:{" "}
                          <span className="font-bold">{sheet.status}</span> • Weightage{" "}
                          {sheet.totalWeightage}%
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => unlockSheet(sheet._id)}
                        disabled={sheet.status === "Unlocked by Admin"}
                      >
                        <LockOpen size={16} className="mr-2" />
                        Unlock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "escalations" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Escalations</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["q1Month", "q2Month", "q3Month", "q4Month", "reminderDaysBefore"] as const).map(
                  (key) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground uppercase">
                        {key}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2"
                        value={Number(escalations[key])}
                        onChange={(e) =>
                          setEscalations({
                            ...escalations,
                            [key]: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )
                )}

                <label className="flex items-center gap-2 text-sm">
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

              <Button onClick={saveEscalations}>
                <Save size={16} className="mr-2" />
                Save Escalation Settings
              </Button>
            </div>
          )}
        </Card>

        <AnalyticsDashboard analytics={analytics} />
      </div>
    </DashboardLayout>
  );
}