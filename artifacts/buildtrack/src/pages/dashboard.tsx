import {
  useGetDashboardStats,
  useGetProjectCards,
  useGetTopVendors,
  useGetAiInsights,
} from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  AlertCircle,
  TrendingUp,
  Clock,
  Wallet,
  Plus,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Info,
  Receipt,
  Building2,
} from "lucide-react"
import { Link, useLocation } from "wouter"
import { format, parseISO } from "date-fns"
import { useMemo, useState } from "react"
import { QuickAddDialog } from "@/components/quick-add-dialog"
import { CATEGORY_COLORS } from "@/lib/utils"

type ProjectCard = NonNullable<ReturnType<typeof useGetProjectCards>["data"]>[number]
type SortKey = "spend" | "status" | "name"

const STATUS_RANK: Record<string, number> = {
  "Over Budget": 0,
  "At Risk": 1,
  "On Track": 2,
  "On Hold": 3,
  Completed: 4,
}

function deriveStatusBadge(p: ProjectCard) {
  if (p.status === "completed") {
    return { label: "Completed", className: "bg-slate-100 text-slate-700 border-slate-200" }
  }
  if (p.status === "on_hold") {
    return { label: "On Hold", className: "bg-amber-50 text-amber-800 border-amber-200" }
  }
  if (p.budget > 0 && p.totalSpent > p.budget) {
    return { label: "Over Budget", className: "bg-red-50 text-red-700 border-red-200" }
  }
  if (p.budget > 0 && p.totalSpent > p.budget * 0.9) {
    return { label: "At Risk", className: "bg-amber-50 text-amber-800 border-amber-200" }
  }
  return { label: "On Track", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
}

function deriveAlerts(p: ProjectCard): string[] {
  const alerts: string[] = []
  if (p.budget > 0 && p.totalSpent > p.budget) {
    const overPct = ((p.totalSpent - p.budget) / p.budget) * 100
    alerts.push(`Over budget by ${overPct.toFixed(0)}%`)
  } else if (p.budget > 0 && p.totalSpent > p.budget * 0.9) {
    const remaining = p.budget - p.totalSpent
    alerts.push(`Within ${(((p.budget - p.totalSpent) / p.budget) * 100).toFixed(0)}% of budget — ${formatRs(remaining)} left`)
  }
  if (p.laborBudget && p.laborBudget > 0 && p.laborSpent > p.laborBudget * 1.05) {
    const overPct = ((p.laborSpent - p.laborBudget) / p.laborBudget) * 100
    alerts.push(`Labour ${overPct.toFixed(0)}% over plan`)
  }
  if (p.profitMargin < 10 && p.totalSpent > 0) {
    alerts.push(`Margin under 10% (${p.profitMargin.toFixed(1)}%)`)
  }
  if (p.thisWeekSpent > 0 && p.budget > 0 && p.thisWeekSpent / p.budget > 0.05) {
    alerts.push(`High weekly spend velocity`)
  }
  return alerts
}

function formatRs(amount: number) {
  return "Rs. " + Math.round(amount).toLocaleString("en-IN")
}

const CATEGORY_FALLBACK_COLOR = "#94a3b8"

function categoryColor(name: string) {
  return (CATEGORY_COLORS as Record<string, string>)[name] ?? CATEGORY_FALLBACK_COLOR
}

function insightIcon(type: string) {
  if (type === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
  if (type === "tip") return <Lightbulb className="w-4 h-4 emerald-600 text-emerald-500 flex-shrink-0 mt-0.5" />
  return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
}

function ProjectCardRow({ project, fmt }: { project: ProjectCard; fmt: (n: number) => string }) {
  const [, navigate] = useLocation()
  const percentSpent = project.budget > 0 ? (project.totalSpent / project.budget) * 100 : 0
  const weekDeltaPercent = project.budget > 0 ? (project.thisWeekSpent / project.budget) * 100 : 0
  const statusBadge = deriveStatusBadge(project)
  const alerts = deriveAlerts(project)
  const profitDisplay = project.profitMargin === 0 ? "—" : `${project.profitMargin >= 0 ? "+" : ""}${project.profitMargin.toFixed(1)}%`
  const profitClass = project.profitMargin < 0 ? "text-destructive" : project.profitMargin < 10 ? "text-amber-600" : "text-emerald-600"

  const topCategories = project.categories.slice(0, 4)

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col lg:flex-row gap-5">
          {/* Identity & Status */}
          <div className="lg:w-1/4 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${statusBadge.className}`}>
                  {statusBadge.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 -mr-2"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  aria-label="More"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{project.name}</h3>
              <div className="flex items-center text-slate-500 text-xs mt-1.5">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {project.location?.trim() ? project.location : "Location not set"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {alerts.length > 0 ? (
                alerts.slice(0, 2).map((alert, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="leading-snug">{alert}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>All systems nominal</span>
                </div>
              )}
            </div>
          </div>

          {/* Financials & Progress */}
          <div className="lg:w-2/4 flex flex-col justify-center lg:border-l border-slate-100 lg:pl-5">
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2 gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Budget Utilized</p>
                  <p className="text-base font-bold text-slate-900 truncate">
                    {fmt(project.totalSpent)} <span className="text-xs font-normal text-slate-500">/ {fmt(project.budget)}</span>
                  </p>
                </div>
                <span className="font-bold text-slate-700 text-sm flex-shrink-0">{percentSpent.toFixed(0)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                <div
                  className={`h-full ${percentSpent > 100 ? "bg-destructive" : "bg-slate-800"} relative z-10`}
                  style={{ width: `${Math.min(Math.max(percentSpent - weekDeltaPercent, 0), 100)}%` }}
                />
                {weekDeltaPercent > 0 && (
                  <div
                    className="h-full bg-primary relative z-10 animate-pulse opacity-80"
                    style={{ width: `${Math.min(weekDeltaPercent, 100)}%` }}
                    title={`This week: ${fmt(project.thisWeekSpent)}`}
                  />
                )}
              </div>
              {project.thisWeekSpent > 0 && (
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-primary font-semibold">
                    +{fmt(project.thisWeekSpent)} this week
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Wallet className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Spend / wk</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{fmt(project.thisWeekSpent)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Margin</span>
                </div>
                <p className={`text-sm font-bold ${profitClass}`}>{profitDisplay}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Days Active</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{project.daysActive}</p>
              </div>
            </div>
          </div>

          {/* Distribution & Actions */}
          <div className="lg:w-1/4 flex flex-col justify-between lg:border-l border-slate-100 lg:pl-5 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Spend Distribution</p>
              {project.categories.length > 0 ? (
                <>
                  <div className="h-2 w-full flex rounded-full overflow-hidden mb-2 bg-slate-100">
                    {topCategories.map((cat) => (
                      <div
                        key={cat.category}
                        className="h-full"
                        style={{ width: `${cat.percent}%`, backgroundColor: categoryColor(cat.category) }}
                        title={`${cat.category}: ${cat.percent.toFixed(0)}%`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                    {topCategories.slice(0, 3).map((cat) => (
                      <div key={cat.category} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor(cat.category) }} />
                        <span className="text-[10px] text-slate-600 font-medium">{cat.category}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No expenses yet</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <QuickAddDialog defaultTab="expense">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white border border-slate-200 hover:border-primary hover:bg-orange-50 text-slate-800 hover:text-primary transition-colors shadow-sm h-9 px-3 text-sm"
                >
                  Add Expense <Plus className="w-4 h-4" />
                </Button>
              </QuickAddDialog>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 bg-slate-50 border-slate-200"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 bg-slate-50 border-slate-200"
                  onClick={() => navigate(`/crew`)}
                >
                  Crew
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { fmt } = useCurrency()
  const [sortKey, setSortKey] = useState<SortKey>("spend")

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats()
  const { data: cards, isLoading: cardsLoading } = useGetProjectCards()
  const { data: topVendors } = useGetTopVendors()
  const {
    data: aiInsights,
    isLoading: aiLoading,
    refetch: refetchAI,
  } = useGetAiInsights({ query: { staleTime: 0, refetchOnMount: false, enabled: false } })

  const isLoading = statsLoading || cardsLoading

  const sortedCards = useMemo(() => {
    if (!cards) return []
    const arr = [...cards]
    if (sortKey === "spend") arr.sort((a, b) => b.totalSpent - a.totalSpent)
    else if (sortKey === "name") arr.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortKey === "status") {
      arr.sort((a, b) => {
        const ra = STATUS_RANK[deriveStatusBadge(a).label] ?? 9
        const rb = STATUS_RANK[deriveStatusBadge(b).label] ?? 9
        return ra - rb
      })
    }
    return arr
  }, [cards, sortKey])

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) return null

  const blendedMargin = stats.profitMargin ?? 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Heading + summary pill + actions */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Active Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Per-site finances at a glance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{stats.activeProjects}</strong> active sites
            </span>
            <span className="mx-3 text-slate-300">•</span>
            <span className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{fmt(stats.totalSpent)}</strong> deployed
            </span>
            <span className="mx-3 text-slate-300">•</span>
            <span className={`text-sm font-medium flex items-center gap-1 ${blendedMargin < 0 ? "text-destructive" : "text-primary"}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <strong>{blendedMargin.toFixed(1)}%</strong> blended margin
            </span>
          </div>
          <QuickAddDialog defaultTab="project">
            <Button className="gap-2 font-semibold gradient-primary text-primary-foreground rounded-lg shadow-md shadow-primary/20 hover:opacity-95">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </QuickAddDialog>
        </div>
      </div>

      {/* Sort row */}
      <div className="flex items-center justify-end gap-2 -mb-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer border-b border-transparent hover:border-border focus:border-primary"
        >
          <option value="spend">Spend (High to Low)</option>
          <option value="status">Status (Risk first)</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {/* Two-column layout: project stack + right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Project stack */}
        <div className="flex flex-col gap-4 min-w-0">
          {sortedCards.length > 0 ? (
            sortedCards.map((p) => <ProjectCardRow key={p.id} project={p} fmt={fmt} />)
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
                <Building2 className="w-10 h-10 text-slate-300" />
                <div>
                  <p className="font-semibold text-foreground">No projects yet</p>
                  <p className="text-sm text-muted-foreground">Create your first project to see it on the dashboard.</p>
                </div>
                <QuickAddDialog defaultTab="project">
                  <Button className="gap-2 font-semibold mt-2">
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                </QuickAddDialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4 xl:sticky xl:top-32 xl:self-start">
          {/* AI Advisor */}
          <Card className="border border-indigo-100 shadow-md bg-gradient-to-b from-indigo-50/50 to-white overflow-hidden rounded-xl">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-primary" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">AI Advisor</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Cross-project analysis</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchAI()}
                  disabled={aiLoading}
                  className="h-8 px-2 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${aiLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {aiLoading ? (
                <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing your spending…</span>
                </div>
              ) : aiInsights?.insights && aiInsights.insights.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {aiInsights.insights.slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="relative">
                      {idx !== 0 && <div className="h-px w-full bg-slate-100 absolute -top-2" />}
                      <div className="flex items-start gap-2 mb-1">
                        {insightIcon(insight.type)}
                        <p className="text-xs text-slate-700 leading-relaxed">{insight.text}</p>
                      </div>
                    </div>
                  ))}
                  {aiInsights.generatedAt && (
                    <p className="text-[10px] text-slate-400">
                      Generated {format(parseISO(aiInsights.generatedAt), "MMM d 'at' h:mm a")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 text-sm text-slate-500">
                  <p>Click <strong className="text-slate-700">Refresh</strong> to generate insights from your spending patterns.</p>
                  <button
                    onClick={() => refetchAI()}
                    className="text-[11px] font-bold text-indigo-600 flex items-center hover:text-indigo-800 transition-colors uppercase tracking-wide mt-3"
                  >
                    Generate Now <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Top Vendors This Period</h3>
              {topVendors && topVendors.length > 0 ? (
                <div className="space-y-2.5">
                  {topVendors.slice(0, 5).map((v) => (
                    <div key={v.vendor} className="flex justify-between items-center gap-2">
                      <span className="text-sm text-slate-600 truncate min-w-0">{v.vendor}</span>
                      <span className="text-sm font-semibold text-slate-900 flex-shrink-0">{fmt(v.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 flex items-center gap-2 text-sm text-slate-400">
                  <Receipt className="w-4 h-4" />
                  <span>No vendor data yet</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
