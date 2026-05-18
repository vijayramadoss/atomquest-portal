"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useGoalStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      typeof window !== "undefined"
        ? (localStorage.getItem("theme") as "light" | "dark" | null)
        : null;

    const preferredTheme = savedTheme || "light";

    setTheme(preferredTheme);
    document.documentElement.classList.toggle("dark", preferredTheme === "dark");
  }, []);

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const scrollToInsights = () => {
    setSidebarOpen(false);

    const section =
      document.getElementById("dashboard-insights") ||
      document.getElementById("analytics") ||
      document.querySelector("[data-section='insights']");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const role = user?.role || "User";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const navItems = useMemo(
    () => [
      {
        label: "Employee",
        description: "Goals & progress",
        href: "/dashboard/employee",
        roles: ["Employee"],
        icon: ClipboardList,
      },
      {
        label: "Manager",
        description: "Reviews & approvals",
        href: "/dashboard/manager",
        roles: ["Manager", "Manager L1"],
        icon: Users,
      },
      {
        label: "Admin",
        description: "Governance & reports",
        href: "/dashboard/admin",
        roles: ["Admin", "Admin/HR"],
        icon: ShieldCheck,
      },
    ],
    []
  );

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[290px] border-r border-border/60 bg-card/90 backdrop-blur-2xl shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center justify-between border-b border-border/60 px-6">
              <Link href="/" className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white shadow-lg">
                  AQ
                </div>

                <div>
                  <h1 className="text-lg font-bold tracking-tight">
                    AtomQuest
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Performance Portal
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 hover:bg-muted lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <p className="mb-4 px-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Workspace
              </p>

              <nav className="space-y-2">
                {visibleNavItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                          active
                            ? "bg-white/15"
                            : "border border-border bg-background"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.label}
                        </p>
                        <p
                          className={`truncate text-xs ${
                            active ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={scrollToInsights}
                  className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                    <BarChart3 size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Insights</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Jump to analytics
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                    <Settings size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Settings</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Theme & preferences
                    </p>
                  </div>
                </button>
              </nav>
            </div>

            <div className="border-t border-border/60 p-5">
              <div className="mb-4 rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Review cycle
                    </p>
                    <p className="mt-1 text-sm font-semibold">FY 2026 • Q1</p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  68% cycle completion
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 font-bold text-white shadow-md">
                  {initial}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium transition hover:bg-accent"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl border border-border bg-card p-3 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                  {role} Dashboard
                </h2>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  Manage goals, reviews, and performance updates
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button className="hidden h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-medium hover:bg-accent sm:flex">
                <Bell size={17} />
              </button>

              <button
                onClick={toggleTheme}
                className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-medium transition hover:bg-accent sm:px-4"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                <span className="hidden sm:inline">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-medium transition hover:bg-accent sm:px-4"
                >
                  <UserRound size={17} className="text-muted-foreground" />
                  <span className="hidden max-w-[140px] truncate sm:inline">
                    {user?.name || "User"}
                  </span>
                  <ChevronDown size={15} className="hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border bg-card p-3 shadow-xl">
                    <div className="border-b border-border p-3">
                      <p className="text-sm font-semibold">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-accent"
                    >
                      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                      Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                    </button>

                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust workspace preferences.
                </p>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-xl p-2 hover:bg-accent"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-sm font-semibold">Appearance</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Switch between light and dark mode.
                </p>

                <button
                  onClick={toggleTheme}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  Use {theme === "dark" ? "Light" : "Dark"} Mode
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-sm font-semibold">Workspace</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  AtomQuest Performance Portal • FY 2026
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-sm font-semibold">Signed in as</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user?.name || "User"} • {role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}