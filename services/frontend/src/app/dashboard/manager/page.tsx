"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Edit3,
  MessageSquare,
  RefreshCw,
  Save,
  Settings,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type Quarter = "q1" | "q2" | "q3" | "q4";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://atomquest-backend-7u7u.onrender.com";

export default function ManagerDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>("q1");
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({});
  const [checkInComments, setCheckInComments] = useState<Record<string, string>>({});
  const [editableGoals, setEditableGoals] = useState<Record<string, any>>({});

  const { addToast } = useToast();

  const getToken = () => localStorage.getItem("token");

  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/goals/manager/team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch team data");
      }

      const incomingTeamData = data.teamData || [];
      setTeamData(incomingTeamData);

      const commentMap: Record<string, string> = {};
      const editMap: Record<string, any> = {};

      incomingTeamData.forEach((teamItem: any) => {
        teamItem.goals?.forEach((goal: any) => {
          (["q1", "q2", "q3", "q4"] as Quarter[]).forEach((q) => {
            if (goal[q]?.checkInComment) {
              commentMap[`${goal._id}-${q}`] = goal[q].checkInComment;
            }
          });

          editMap[goal._id] = {
            title: goal.title || "",
            description: goal.description || "",
            thrustArea: goal.thrustArea || "",
            uom: goal.uom || "Numeric",
            target: goal.target ?? 0,
            targetDate: goal.targetDate || "",
            weightage: goal.weightage ?? 10,
            isShared: goal.isShared || false,
          };
        });
      });

      setCheckInComments(commentMap);
      setEditableGoals(editMap);
    } catch (err: any) {
      setError(err.message || "Failed to load manager dashboard");
      addToast("Failed to load manager dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEditableGoal = (goalId: string, field: string, value: any) => {
    setEditableGoals((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const getPendingCount = () => {
    return teamData.filter((td) => td.sheet?.status === "Submitted").length;
  };

  const getApprovedCount = () => {
    return teamData.filter((td) => td.sheet?.status === "Approved").length;
  };

  const getRejectedCount = () => {
    return teamData.filter((td) => td.sheet?.status === "Rejected").length;
  };

  const getTotalGoalsCount = () => {
    return teamData.reduce((sum, td) => sum + Number(td.goals?.length || 0), 0);
  };

  const getExpandedData = () => {
    return teamData.find((td) => td.employee?._id === expandedId);
  };

  const calculateLocalTotalWeightage = (goals: any[]) => {
    return goals.reduce((sum, goal) => {
      const draft = editableGoals[goal._id];
      return sum + Number(draft?.weightage ?? goal.weightage ?? 0);
    }, 0);
  };

  const handleManagerGoalEdit = async (goalId: string) => {
    const draft = editableGoals[goalId];

    if (!draft) {
      addToast("No goal changes found", "error");
      return;
    }

    if (Number(draft.weightage) < 10) {
      addToast("Each goal weightage must be at least 10%", "error");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      const payload = {
        title: draft.title,
        description: draft.description,
        thrustArea: draft.thrustArea,
        uom: draft.uom,
        target: Number(draft.target),
        targetDate: draft.targetDate || undefined,
        weightage: Number(draft.weightage),
        isShared: Boolean(draft.isShared),
      };

      const res = await fetch(`${API_URL}/api/goals/${goalId}/manager-edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update goal");
      }

      addToast("Goal updated successfully", "success");
      await fetchTeamData();
    } catch (err: any) {
      addToast(err.message || "Failed to update goal", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (sheetId: string) => {
    if (!sheetId) {
      addToast("No goal sheet found", "error");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      const res = await fetch(`${API_URL}/api/goals/${sheetId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve goal sheet");
      }

      addToast("Goal sheet approved successfully", "success");
      await fetchTeamData();
    } catch (err: any) {
      addToast(err.message || "Failed to approve goal sheet", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (sheetId: string) => {
    const comment = rejectionComments[sheetId];

    if (!comment?.trim()) {
      addToast("Please provide a rework comment before rejecting", "error");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      const res = await fetch(`${API_URL}/api/goals/${sheetId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rejectionComment: comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reject goal sheet");
      }

      addToast("Goal sheet sent back for rework", "success");
      await fetchTeamData();
    } catch (err: any) {
      addToast(err.message || "Failed to reject goal sheet", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (goalId: string) => {
    const comment = checkInComments[`${goalId}-${selectedQuarter}`];

    if (!comment?.trim()) {
      addToast("Please enter a review comment before saving", "error");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      const res = await fetch(`${API_URL}/api/goals/${goalId}/review/${selectedQuarter}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checkInComment: comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      addToast(`${selectedQuarter.toUpperCase()} review saved successfully`, "success");
      await fetchTeamData();
    } catch (err: any) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "Submitted") {
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }

    if (status === "Approved") {
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }

    if (status === "Rejected") {
      return "bg-red-500/10 text-red-500 border border-red-500/20";
    }

    return "bg-muted text-muted-foreground border border-border";
  };

  const selectedData = getExpandedData();

  return (
    <DashboardLayout>
      <div className="space-y-8 mb-16">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Manager Workspace
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Approval Center
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Review team goals, request rework, approve goal sheets, and add quarterly manager feedback.
            </p>
          </div>

          <button
            onClick={fetchTeamData}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-semibold shadow-sm hover:bg-accent disabled:opacity-60 sm:w-fit"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh Team Data
          </button>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <h2 className="mt-3 text-4xl font-bold">{teamData.length}</h2>
                <p className="mt-2 text-xs text-muted-foreground">Assigned employees</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Users size={26} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <h2 className="mt-3 text-4xl font-bold text-amber-500">
                  {getPendingCount()}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">Awaiting manager action</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Clock3 size={26} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Approved Sheets</p>
                <h2 className="mt-3 text-4xl font-bold text-emerald-500">
                  {getApprovedCount()}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">Completed approvals</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={26} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Goals</p>
                <h2 className="mt-3 text-4xl font-bold text-primary">
                  {getTotalGoalsCount()}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">Goals under review</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target size={26} />
              </div>
            </div>
          </Card>
        </section>

        {loading ? (
          <Card className="p-10">
            <div className="flex animate-pulse justify-center py-10 opacity-70">
              <RefreshCw size={24} className="animate-spin text-primary" />
              <span className="ml-3 text-sm text-foreground my-auto">
                Loading team data...
              </span>
            </div>
          </Card>
        ) : error ? (
          <Card className="border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-500 mb-1">
                  Error Loading Data
                </h3>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
              <Button
                variant="outline"
                className="ml-auto bg-transparent border-red-500/20 text-red-500 hover:bg-red-500/10"
                onClick={fetchTeamData}
              >
                Retry
              </Button>
            </div>
          </Card>
        ) : teamData.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              No Team Members Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You currently do not have any employees assigned to you for performance review.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-xl font-bold tracking-tight">Review Queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Expand employees to review submitted goals, edit details, approve, or request rework.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-muted/50 text-foreground uppercase text-xs border-b border-border">
                  <tr>
                    <th className="px-6 py-5 font-semibold tracking-wider">Employee</th>
                    <th className="px-6 py-5 font-semibold tracking-wider">Department</th>
                    <th className="px-6 py-5 font-semibold tracking-wider">Goals Total Wt %</th>
                    <th className="px-6 py-5 font-semibold tracking-wider">Sheet Status</th>
                    <th className="px-6 py-5 font-semibold tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {teamData.map((data) => {
                    const emp = data.employee;
                    const sheet = data.sheet;
                    const status = sheet?.status || "Not Created";
                    const statusBadgeClass = getStatusBadgeClass(status);

                    return (
                      <tr key={emp._id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-6 py-5 font-medium text-foreground">
                          {emp.name}
                          <div className="text-xs text-muted-foreground mt-1">
                            {emp.email}
                          </div>
                        </td>

                        <td className="px-6 py-5">{emp.department || "N/A"}</td>

                        <td className="px-6 py-5">
                          <span className="text-primary font-bold">
                            {sheet?.totalWeightage || 0}%
                          </span>
                          <span className="text-xs ml-1 opacity-60">
                            ({sheet?.goalsCount || 0} goals)
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${statusBadgeClass}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                setExpandedId(expandedId === emp._id ? null : emp._id)
                              }
                              disabled={!sheet}
                              className="text-primary hover:text-primary/80 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Review / Edit Goals"
                            >
                              <Edit3 size={18} />
                            </button>

                            <button
                              onClick={() => handleApprove(sheet?._id)}
                              disabled={status !== "Submitted" || actionLoading}
                              className="text-emerald-500 hover:text-emerald-400 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Approve Goals"
                            >
                              <CheckCircle2 size={18} />
                            </button>

                            <button
                              onClick={() =>
                                setExpandedId(expandedId === emp._id ? null : emp._id)
                              }
                              disabled={status !== "Submitted"}
                              className="text-purple-500 hover:text-purple-400 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Request Rework"
                            >
                              <MessageSquare size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {expandedId && selectedData && (
              <div className="bg-background/80 border-t border-border animate-in slide-in-from-top-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/70"></div>

                {!selectedData.sheet ? (
                  <div className="p-8 text-muted-foreground text-sm">
                    No goal sheet found.
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 flex flex-col gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          Review: {selectedData.employee.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Department: {selectedData.employee.department || "N/A"} • Status:{" "}
                          {selectedData.sheet.status}
                        </p>
                      </div>

                      <Button variant="outline" onClick={fetchTeamData}>
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                      </Button>
                    </div>

                    {(selectedData.sheet.status === "Submitted" ||
                      selectedData.sheet.status === "Rejected") && (
                      <div className="bg-card p-6 rounded-xl border border-border">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <MessageSquare size={16} className="text-purple-500" />
                          Rework / Rejection Comment
                          <span className="text-xs text-muted-foreground font-normal">
                            Required before rejecting
                          </span>
                        </h4>

                        {selectedData.sheet.rejectionComment && (
                          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                            Previous rejection: {selectedData.sheet.rejectionComment}
                          </div>
                        )}

                        <textarea
                          value={rejectionComments[selectedData.sheet._id] || ""}
                          onChange={(e) =>
                            setRejectionComments((prev) => ({
                              ...prev,
                              [selectedData.sheet._id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-y"
                          placeholder="Provide feedback on why the goal sheet needs rework..."
                        />

                        <div className="mt-4 flex flex-wrap justify-end gap-3">
                          <Button
                            variant="outline"
                            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleReject(selectedData.sheet._id)}
                            disabled={selectedData.sheet.status !== "Submitted" || actionLoading}
                          >
                            <XCircle size={16} className="mr-2" />
                            Reject & Request Rework
                          </Button>

                          <Button
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => handleApprove(selectedData.sheet._id)}
                            disabled={selectedData.sheet.status !== "Submitted" || actionLoading}
                          >
                            <CheckCircle2 size={16} className="mr-2" />
                            Approve Goal Sheet
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex border-b border-border mb-6 overflow-x-auto">
                        {(["q1", "q2", "q3", "q4"] as Quarter[]).map((q) => (
                          <button
                            key={q}
                            onClick={() => setSelectedQuarter(q)}
                            className={`px-6 py-3 text-sm font-semibold capitalize tracking-wider border-b-2 transition-all ${
                              selectedQuarter === q
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {q.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h3 className="text-foreground font-semibold text-base tracking-tight">
                          {selectedQuarter.toUpperCase()} Goal Reviews & Manager Edits
                        </h3>

                        <div className="text-xs text-muted-foreground">
                          Local total weightage:{" "}
                          <span
                            className={
                              calculateLocalTotalWeightage(selectedData.goals) === 100
                                ? "text-emerald-400 font-bold"
                                : "text-red-400 font-bold"
                            }
                          >
                            {calculateLocalTotalWeightage(selectedData.goals)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {selectedData.goals.length === 0 ? (
                          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                            No goals found for this employee.
                          </div>
                        ) : (
                          selectedData.goals.map((goal: any) => {
                            const qt = goal[selectedQuarter] || {};
                            const draft = editableGoals[goal._id] || goal;

                            return (
                              <div
                                key={goal._id}
                                className="relative bg-card border border-border rounded-xl p-5 shadow-sm"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                      Thrust Area
                                    </label>
                                    <input
                                      value={draft.thrustArea}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "thrustArea", e.target.value)
                                      }
                                      className="w-full bg-accent/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                      Goal Title
                                    </label>
                                    <input
                                      value={draft.title}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "title", e.target.value)
                                      }
                                      className="w-full bg-accent/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>

                                  <div className="lg:col-span-2">
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                      Description
                                    </label>
                                    <textarea
                                      value={draft.description}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "description", e.target.value)
                                      }
                                      rows={2}
                                      className="w-full bg-accent/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary resize-y"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                                  <div className="bg-accent/30 p-3 rounded-lg border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                      UoM
                                    </div>
                                    <select
                                      value={draft.uom}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "uom", e.target.value)
                                      }
                                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground"
                                    >
                                      <option value="Numeric">Numeric</option>
                                      <option value="%">%</option>
                                      <option value="Timeline">Timeline</option>
                                      <option value="Zero-based">Zero-based</option>
                                    </select>
                                  </div>

                                  <div className="bg-accent/30 p-3 rounded-lg border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                      Target
                                    </div>
                                    <input
                                      type="number"
                                      value={draft.target}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "target", Number(e.target.value))
                                      }
                                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground"
                                    />
                                  </div>

                                  <div className="bg-accent/30 p-3 rounded-lg border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                      Weightage %
                                    </div>
                                    <input
                                      type="number"
                                      value={draft.weightage}
                                      onChange={(e) =>
                                        updateEditableGoal(goal._id, "weightage", Number(e.target.value))
                                      }
                                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground"
                                    />
                                  </div>

                                  <div className="bg-accent/30 p-3 rounded-lg border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-primary mb-1">
                                      Achieved
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                      {qt.achievement || 0}
                                    </div>
                                  </div>

                                  <div className="bg-accent/30 p-3 rounded-lg border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-primary mb-1">
                                      Status
                                    </div>
                                    <div
                                      className={`text-sm font-bold ${
                                        qt.status === "Completed"
                                          ? "text-emerald-500"
                                          : qt.status === "On Track"
                                          ? "text-amber-500"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {qt.status || "Not Started"}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-xs text-muted-foreground block uppercase font-semibold tracking-wider">
                                    Manager Feedback / Check-in Comment
                                  </label>

                                  <textarea
                                    value={checkInComments[`${goal._id}-${selectedQuarter}`] ?? ""}
                                    onChange={(e) =>
                                      setCheckInComments((prev) => ({
                                        ...prev,
                                        [`${goal._id}-${selectedQuarter}`]: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-y"
                                    placeholder={`Provide structured feedback concerning ${selectedQuarter.toUpperCase()} pacing...`}
                                  />

                                  <div className="flex flex-wrap justify-end gap-3">
                                    <Button
                                      onClick={() => handleSubmitReview(goal._id)}
                                      disabled={
                                        !checkInComments[`${goal._id}-${selectedQuarter}`]?.trim() ||
                                        actionLoading
                                      }
                                    >
                                      <MessageSquare size={16} className="mr-2" />
                                      Save Review
                                    </Button>

                                    <Button
                                      variant="outline"
                                      onClick={() => handleManagerGoalEdit(goal._id)}
                                      disabled={actionLoading}
                                    >
                                      <Save size={16} className="mr-2" />
                                      Save Goal Changes
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <section id="dashboard-insights" className="space-y-6 scroll-mt-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={22} />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manager Insights</h2>
              <p className="text-sm text-muted-foreground">
                Approval performance, review progress, and team workflow health.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <h3 className="mt-2 text-4xl font-bold text-amber-500">
                {getPendingCount()}
              </h3>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Approved Sheets</p>
              <h3 className="mt-2 text-4xl font-bold text-emerald-500">
                {getApprovedCount()}
              </h3>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Team Goals</p>
              <h3 className="mt-2 text-4xl font-bold text-primary">
                {getTotalGoalsCount()}
              </h3>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Rejected Reviews</p>
              <h3 className="mt-2 text-4xl font-bold text-red-500">
                {getRejectedCount()}
              </h3>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-6 xl:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Review Performance</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Team approval workflow insights
                  </p>
                </div>

                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp size={18} />
                  <span className="text-sm font-semibold">+18%</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Quarterly Completion</span>
                    <span className="text-sm font-bold">68%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[68%] rounded-full bg-primary" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Review Coverage</span>
                    <span className="text-sm font-bold">84%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[84%] rounded-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest review events
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Goal sheet approved",
                  "Rework requested",
                  "Q1 review updated",
                  "Shared KPI updated",
                ].map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <div
                      className={`mt-2 h-3 w-3 rounded-full ${
                        index === 0
                          ? "bg-emerald-500"
                          : index === 1
                          ? "bg-amber-500"
                          : index === 2
                          ? "bg-primary"
                          : "bg-purple-500"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Manager workflow updated successfully.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="dashboard-notifications" className="space-y-5 scroll-mt-8">
          <div className="flex items-center gap-3">
            <Bell className="text-primary" size={22} />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Review alerts and pending workflow reminders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <p className="font-semibold">Pending approval queue</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {getPendingCount()} employee goal sheet(s) need approval.
              </p>
            </Card>

            <Card className="p-5">
              <p className="font-semibold">Quarter check-in reminder</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Q1 review window is active for manager feedback.
              </p>
            </Card>

            <Card className="p-5">
              <p className="font-semibold">Rework monitoring</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Track rejected sheets and employee resubmissions.
              </p>
            </Card>
          </div>
        </section>

        <section id="dashboard-settings" className="space-y-5 scroll-mt-8">
          <div className="flex items-center gap-3">
            <Settings className="text-primary" size={22} />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manager Settings</h2>
              <p className="text-sm text-muted-foreground">
                Workflow preferences and review cycle information.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Review Cycle</p>
              <p className="mt-2 text-lg font-bold">FY 2026–2027 • Q1</p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Approval Mode</p>
              <p className="mt-2 text-lg font-bold">Manager Review Enabled</p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Access Level</p>
              <p className="mt-2 text-lg font-bold">Manager Workspace</p>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}