"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGoalStore } from "@/store/useGoalStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useGoalStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const role = user?.role || "User";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const navItems = [
    {
      label: "Employee Dashboard",
      href: "/dashboard/employee",
      roles: ["Employee"],
    },
    {
      label: "Manager Dashboard",
      href: "/dashboard/manager",
      roles: ["Manager", "Manager L1"],
    },
    {
      label: "Admin Dashboard",
      href: "/dashboard/admin",
      roles: ["Admin", "Admin/HR"],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-white/10 bg-card/60 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-bold">AtomQuest</h1>
          <p className="text-sm text-muted-foreground">Goal Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-accent border border-white/10 flex items-center justify-center font-bold">
              {initial}
            </div>

            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}