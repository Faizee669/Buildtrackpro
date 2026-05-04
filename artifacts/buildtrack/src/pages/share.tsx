import { useEffect, useState } from "react"
import { useRoute } from "wouter"
import {
  HardHat,
  MapPin,
  Calendar,
  Wallet,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Building2,
  PieChart,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface ProjectReport {
  project: {
    id: number
    name: string
    description: string | null
    location: string | null
    status: string
    startDate: string
    budget: number
    totalSpent: number
    laborSpent: number
    materialSpent: number
    remainingBudget: number
    profitMargin: number
  }
  phases: Array<{ id: number; name: string; status: string; totalExpenses: number }>
  categoryBreakdown: Array<{ category: string; amount: number }>
  recentExpenses: Array<{ id: number; category: string; amount: number; date: string; vendor: string | null; notes: string | null }>
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    on_hold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  }
  const label: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    on_hold: "On Hold",
  }
  return (
    <Badge className={`text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {label[status] ?? status}
    </Badge>
  )
}

export default function SharePage() {
  const [, params] = useRoute("/share/:token")
  const token = params?.token
  const [data, setData] = useState<ProjectReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
    fetch(`${apiBase}/api/public/projects/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((d) => setData(d))
      .catch(() => setError("Project not found or the link has been revoked."))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl">
            <HardHat className="w-6 h-6" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading report…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full border-card-border">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="bg-red-100 text-red-500 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-lg">Report Unavailable</h1>
            <p className="text-sm text-muted-foreground">{error ?? "Something went wrong."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { project, phases, categoryBreakdown, recentExpenses } = data
  const budgetPct = project.budget > 0 ? Math.min(100, (project.totalSpent / project.budget) * 100) : 0
  const isOverBudget = project.totalSpent > project.budget && project.budget > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm shadow-primary/30">
              <HardHat className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">
              BuildTrack <span className="text-primary">Pro+</span>
            </span>
          </div>
          <Badge className="text-xs bg-muted text-muted-foreground border-border">
            Shared Report · Read-only
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Project header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {project.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Started {format(new Date(project.startDate), "dd MMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Budget overview */}
        <Card className="border-card-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-card-border">
              {[
                { label: "Budget", value: fmtCurrency(project.budget), icon: Wallet, color: "text-blue-500" },
                {
                  label: "Spent",
                  value: fmtCurrency(project.totalSpent),
                  icon: TrendingDown,
                  color: isOverBudget ? "text-red-500" : "text-foreground",
                },
                {
                  label: "Remaining",
                  value: fmtCurrency(Math.abs(project.remainingBudget)),
                  icon: Wallet,
                  color: project.remainingBudget >= 0 ? "text-green-500" : "text-red-500",
                },
                { label: "Labor Cost", value: fmtCurrency(project.laborSpent), icon: Building2, color: "text-orange-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center py-5 px-4 text-center">
                  <Icon className={`w-5 h-5 mb-2 ${color}`} />
                  <span className={`text-xl font-black ${color}`}>{value}</span>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">{label}</span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="px-6 pb-5 pt-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Budget usage</span>
                <span className={`font-bold ${isOverBudget ? "text-red-500" : "text-foreground"}`}>
                  {budgetPct.toFixed(1)}%
                  {isOverBudget && " (over budget)"}
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? "bg-red-500" : budgetPct > 80 ? "bg-orange-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown + phases */}
        <div className="grid sm:grid-cols-2 gap-6">
          {categoryBreakdown.length > 0 && (
            <Card className="border-card-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">Spending by Category</h2>
                </div>
                <div className="space-y-3">
                  {categoryBreakdown.map((c) => {
                    const pct = project.totalSpent > 0 ? (c.amount / project.totalSpent) * 100 : 0
                    return (
                      <div key={c.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{c.category}</span>
                          <span className="text-muted-foreground">{fmtCurrency(c.amount)} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {phases.length > 0 && (
            <Card className="border-card-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">Project Phases</h2>
                </div>
                <div className="space-y-3">
                  {phases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          p.status === "completed" ? "bg-green-500" :
                          p.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"
                        }`} />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{fmtCurrency(p.totalExpenses)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent expenses */}
        {recentExpenses.length > 0 && (
          <Card className="border-card-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm">Recent Expenses</h2>
              </div>
              <div className="space-y-3">
                {recentExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-card-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                          {e.category}
                        </Badge>
                        {e.vendor && <span className="text-xs text-muted-foreground truncate">{e.vendor}</span>}
                      </div>
                      {e.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-bold">{fmtCurrency(e.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(e.date), "dd MMM")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
          Generated by BuildTrack Pro+ · Construction Expense Manager
        </div>
      </main>
    </div>
  )
}
