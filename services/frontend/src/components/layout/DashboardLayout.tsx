"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BarChart3,
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Target,
  Users,
  X,
} from "lucide-react";

import { useGoalStore } from "@/store/useGoalStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useGoalStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark";

    setTheme(savedTheme);

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);

    if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const role = user?.role || "Employee";

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const navItems = [
    {
      label: "Employee",
      href: "/dashboard/employee",
      icon: Target,
      roles: ["Employee"],
    },

    {
      label: "Manager",
      href: "/dashboard/manager",
      icon: Users,
      roles: ["Manager", "Manager L1"],
    },

    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      roles: ["Admin", "Admin/HR"],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  const quickMenu = [
    {
      label: "Insights",
      href: "#dashboard-insights",
      icon: BarChart3,
    },

    {
      label: "Notifications",
      href: "#dashboard-notifications",
      icon: Bell,
    },

    {
      label: "Settings",
      href: "#dashboard-settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              AtomQuest
            </h1>

            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Enterprise KPI Suite
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
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
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />

                    <span className="font-semibold">
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      active
                        ? "translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 px-4">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Quick Access
          </p>

          <div className="space-y-2">
            {quickMenu.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith("#")) {
                      e.preventDefault();

                      const target = document.querySelector(item.href);

                      if (target) {
                        target.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }

                      setSidebarOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <Icon size={17} />

                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-auto border-t border-border p-5">
          <div className="rounded-3xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {role}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card transition hover:bg-accent"
              >
                {theme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}

                <span className="text-sm font-semibold">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground transition hover:opacity-90"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Review Cycle
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">
                  FY 2026–2027
                </p>

                <p className="text-xs text-muted-foreground">
                  Q1 Active Window
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
                Active
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[280px]">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}