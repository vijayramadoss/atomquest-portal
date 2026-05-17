import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface GoalStore {
  token: string | null;
  user: User | null;
  goals: any;
  setAuth: (token: string, user: User) => void;
  fetchGoals: () => Promise<void>;
  saveDraftGoalSheet: (financialYear: string, goals: any[]) => Promise<any>;
  submitGoalSheet: (financialYear: string, goals: any[]) => Promise<any>;
}

const normalizeGoals = (goals: any[]) => {
  return goals.map((goal) => {
    const isTimeline = goal.uom === "Timeline";

    return {
      thrustArea: goal.thrustArea,
      title: goal.title,
      description: goal.description,
      uom: goal.uom,
      target: isTimeline ? 0 : Number(goal.target),
      ...(isTimeline && {
        targetDate: goal.target,
      }),
      weightage: Number(goal.weightage),
      isShared: goal.isShared || false,
    };
  });
};

export const useGoalStore = create<GoalStore>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,

  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,

  goals: null,

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  fetchGoals: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5005/api/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        set({ goals: data });
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  },

  // Save Draft only creates/updates goals.
  // Sheet stays Draft.
  saveDraftGoalSheet: async (financialYear, goals) => {
    const { token } = get();
    if (!token) throw new Error("No token");

    const normalizedGoals = normalizeGoals(goals);

    const res = await fetch("http://localhost:5005/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        year: Number(financialYear) || 2026,
        goals: normalizedGoals,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to save draft");
    }

    await get().fetchGoals();
    return data;
  },

  // Submit Goals first saves goals, then submits sheet.
  // Sheet becomes Submitted, so manager can approve/reject.
  submitGoalSheet: async (financialYear, goals) => {
    const { token } = get();
    if (!token) throw new Error("No token");

    const normalizedGoals = normalizeGoals(goals);

    const saveRes = await fetch("http://localhost:5005/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        year: Number(financialYear) || 2026,
        goals: normalizedGoals,
      }),
    });

    const saveData = await saveRes.json();

    if (!saveRes.ok) {
      throw new Error(saveData.message || "Failed to save goals");
    }

    const sheetId = saveData.sheet?._id;

    if (!sheetId) {
      throw new Error("GoalSheet ID not found after saving goals");
    }

    const submitRes = await fetch(
      `http://localhost:5005/api/goals/${sheetId}/submit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const submitData = await submitRes.json();

    if (!submitRes.ok) {
      throw new Error(submitData.message || "Failed to submit goal sheet");
    }

    await get().fetchGoals();
    return submitData;
  },
}));