"use client";
import { Users, FileSpreadsheet, Unplug, ShieldAlert } from "lucide-react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8 mb-16">
        <header className="mb-10 border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 mb-2 tracking-tight">Admin & HR Governance</h1>
            <p className="text-muted-foreground text-sm">System-wide Settings, KPIs, and Escalation Engine Controls</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:bg-accent/40 transition-all hover:scale-[1.02] group cursor-pointer border-border flex flex-col gap-4 shadow-sm">
             <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform w-fit inner-shadow">
               <Users size={24} />
             </div>
             <div>
               <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Shared Goals</h2>
               <p className="text-xs text-muted-foreground leading-relaxed">Push departmental KPIs vertically down to all employees.</p>
             </div>
          </Card>

          <Card className="p-6 hover:bg-accent/40 transition-all hover:scale-[1.02] group cursor-pointer border-border flex flex-col gap-4 shadow-sm">
             <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform w-fit inner-shadow">
               <FileSpreadsheet size={24} />
             </div>
             <div>
               <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Data Reports</h2>
               <p className="text-xs text-muted-foreground leading-relaxed">Export quarterly target vs actual metrics via CSV.</p>
             </div>
          </Card>

          <Card className="p-6 hover:bg-accent/40 transition-all hover:scale-[1.02] group cursor-pointer border-border flex flex-col gap-4 shadow-sm">
             <div className="p-3 bg-destructive/10 text-destructive rounded-xl group-hover:scale-110 transition-transform w-fit inner-shadow">
               <ShieldAlert size={24} />
             </div>
             <div>
               <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Master Unlock</h2>
               <p className="text-xs text-muted-foreground leading-relaxed">Admin override to unlock approved Goal Sheets.</p>
             </div>
          </Card>

          <Card className="p-6 hover:bg-accent/40 transition-all hover:scale-[1.02] group cursor-pointer border-border flex flex-col gap-4 shadow-sm">
             <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform w-fit inner-shadow">
               <Unplug size={24} />
             </div>
             <div>
               <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Escalations</h2>
               <p className="text-xs text-muted-foreground leading-relaxed">Configure Check-in window delays and penalties.</p>
             </div>
          </Card>
        </div>

        <div className="mt-8">
            <AnalyticsDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
}
