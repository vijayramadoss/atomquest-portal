"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://atomquest-backend-7u7u.onrender.com";

export default function Home() {
  const router = useRouter();
  const { setAuth } = useGoalStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("Employee");

  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const bodyPayload = isLogin
        ? { email, password }
        : { name, email, password, role };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (isLogin) {
        setAuth(data.token, data.user);

        const normalizedRole = data.user.role?.toLowerCase();

        if (normalizedRole.includes("employee")) {
          router.push("/dashboard/employee");
        } else if (normalizedRole.includes("manager")) {
          router.push("/dashboard/manager");
        } else if (normalizedRole.includes("admin")) {
          router.push("/dashboard/admin");
        } else {
          alert("Unknown role: " + data.user.role);
        }
      } else {
        alert("Account created successfully. Please sign in.");

        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-bold">
                AQ
              </div>
              <div>
                <h1 className="text-lg font-bold">AtomQuest</h1>
                <p className="text-sm text-slate-400">Performance Portal</p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                Goal governance platform
              </p>

              <h2 className="text-5xl font-semibold tracking-tight leading-tight">
                Align teams, track outcomes, and close review cycles.
              </h2>

              <p className="mt-6 text-base leading-7 text-slate-300">
                A role-based platform for employees, managers, and HR teams to manage goals,
                quarterly check-ins, reviews, approvals, and governance insights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">3</p>
              <p className="text-slate-400">User roles</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">4</p>
              <p className="text-slate-400">Quarter cycles</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-slate-400">Weight validation</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold">
                  AQ
                </div>
                <div>
                  <h1 className="text-lg font-bold">AtomQuest</h1>
                  <p className="text-sm text-muted-foreground">Performance Portal</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck size={24} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  {isLogin ? "Sign in to your workspace" : "Create your account"}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {isLogin
                    ? "Use your assigned employee, manager, or admin credentials."
                    : "Register with your role to access the portal."}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label className="aq-label">Full name</label>
                      <div className="relative">
                        <User
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="aq-input pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="aq-label">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="aq-input"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="aq-label">Email address</label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="aq-input pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="aq-label">Password</label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="aq-input pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
                  <ArrowRight size={17} />
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="mt-6 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {isLogin ? "Need an account? Create one" : "Already registered? Sign in"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}