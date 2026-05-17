"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GoalForm from "@/components/GoalForm";
import QuarterlyTracking from "@/components/QuarterlyTracking";

export default function EmployeeDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-10 mb-16">
        <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-border pb-6 animate-in slide-in-from-top-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2 tracking-tight">Employee Objective Hub</h1>
            <p className="text-muted-foreground text-sm">FY 2026-2027 • Strategy & Implementation</p>
          </div>
          <div className="text-[11px] font-bold px-4 py-2 rounded-lg bg-accent/80 text-foreground border border-border flex items-center justify-center uppercase tracking-widest shadow-sm">
            Phase 1 Window Active
          </div>
        </header>

        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <GoalForm />
        </section>
        
        <section className="animate-in slide-in-from-bottom-4 duration-700">
          <QuarterlyTracking />
        </section>
      </div>
    </DashboardLayout>
  );
}
