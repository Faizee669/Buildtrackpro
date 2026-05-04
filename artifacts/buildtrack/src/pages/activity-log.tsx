import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, Package, Receipt, Settings, Users, Wrench, HardHat, TrendingUp } from "lucide-react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useCurrency } from "@/lib/currency-context";

type AuditLog = {
  id: number;
  action: "created" | "updated" | "deleted" | string;
  entityType: "project" | "phase" | "expense" | "crew" | "inventory" | "settings" | string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

function fmtDateTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function dateGroup(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown Date";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const entry = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (entry === today) return "Today";
  if (entry === today - 86400000) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function entityIcon(entityType: string) {
  if (entityType === "expense") return <Receipt className="w-4 h-4" />;
  if (entityType === "crew") return <Users className="w-4 h-4" />;
  if (entityType === "inventory") return <Package className="w-4 h-4" />;
  if (entityType === "project") return <HardHat className="w-4 h-4" />;
  if (entityType === "phase") return <Wrench className="w-4 h-4" />;
  return <Settings className="w-4 h-4" />;
}

function actionBadge(action: string) {
  if (action === "created") return "bg-emerald-100 text-emerald-700";
  if (action === "updated") return "bg-blue-100 text-blue-700";
  if (action === "deleted") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
  const sid = typeof window !== "undefined" ? localStorage.getItem("bt_sid") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (sid) headers["Authorization"] = `Bearer ${sid}`;
  const response = await fetch(`${apiBase}/api/audit-logs?limit=300`, { 
    credentials: "include",
    headers
  });
  if (!response.ok) throw new Error(`Failed to load activity log (${response.status})`);
  return response.json();
}

export default function ActivityLogPage() {
  const { fmt } = useCurrency();
  const { data: stats } = useGetDashboardStats();
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    refetchInterval: 30_000,
  });

  const grouped = useMemo(() => {
    const groups = new Map<string, AuditLog[]>();
    for (const row of data ?? []) {
      const key = dateGroup(row.createdAt);
      const existing = groups.get(key);
      if (existing) existing.push(row);
      else groups.set(key, [row]);
    }
    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  }, [data]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Activity Log
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            System audit trail for projects, phases, expenses, crew, inventory, and settings.
          </p>
        </div>
        {!isLoading && <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{(data ?? []).length} events</span>}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Total System Cost</span>
            <span className="text-2xl font-bold text-foreground mt-1">{fmt(stats.totalSpent ?? 0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Users className="w-4 h-4" /> Labor & Crew</span>
            <span className="text-xl font-bold text-foreground mt-1">{fmt(stats.laborSpent ?? 0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Package className="w-4 h-4" /> Materials & Other</span>
            <span className="text-xl font-bold text-foreground mt-1">{fmt(stats.materialSpent ?? 0)}</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="py-10 border border-border rounded-xl bg-card text-center text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && (data ?? []).length === 0 && (
        <div className="py-20 border border-border rounded-xl bg-card text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      )}

      {!isLoading && !isError && grouped.map((group) => (
        <section key={group.label} className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            <CalendarDays className="w-3.5 h-3.5" />
            {group.label}
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <article key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  {entityIcon(item.entityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm truncate">{item.summary}</p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap" title={item.createdAt}>
                      {fmtDateTime(item.createdAt)}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionBadge(item.action)}`}>
                      {item.action}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.entityType}
                    </span>
                    {item.entityId && (
                      <span className="text-[10px] text-muted-foreground">ID: {item.entityId}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
