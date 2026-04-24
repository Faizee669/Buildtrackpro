import { useQuery } from "@tanstack/react-query"
import { useCurrency } from "@/lib/currency-context"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Area, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell,
} from "recharts"
import {
  TrendingUp, DollarSign, Users, CalendarDays,
  ReceiptText, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react"
import { format, parseISO } from "date-fns"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

function useAnalytics<T>(key: string, endpoint: string) {
  return useQuery<T>({
    queryKey: ["analytics", key],
    queryFn: () =>
      fetch(`${BASE}/api/${endpoint}`, { credentials: "include" }).then(r => r.json()),
    staleTime: 60_000,
  })
}

const CHART_COLORS = [
  "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
  "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)", "var(--color-chart-7)",
]

const CATEGORIES = ["Possession", "Foundation", "Cement", "Aggregates", "Bricks", "Steel", "Labour", "Paint", "Electric", "Wood", "Door Frame", "Plumbing", "Watchman Salary"]

interface Summary {
  totalExpenses: number
  avgExpense: number
  largestExpense: number
  uniqueVendors: number
  hotMonth: string
  hotMonthTotal: number
}

interface CategoryTrendRow { month: string; [cat: string]: string | number }

interface DailyRow { day: string; total: number; count: number }

interface DowRow { day: string; total: number; count: number }

interface ProjectHealth {
  id: string; name: string; budget: number; spent: number;
  remaining: number; pctUsed: number; expenseCount: number;
  status: string; lastExpenseDate: string | null;
}

interface RadarRow { category: string; total: number }

function StatCard({ icon: Icon, label, value, sub, color }:
  { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HealthBadge({ pct }: { pct: number }) {
  if (pct >= 90) return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
      <AlertTriangle className="w-3.5 h-3.5" /> Over Budget
    </span>
  )
  if (pct >= 70) return (
    <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
      <Clock className="w-3.5 h-3.5" /> Watch
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
      <CheckCircle2 className="w-3.5 h-3.5" /> On Track
    </span>
  )
}

export default function Analytics() {
  const { fmt } = useCurrency()

  const fmtK = (v: number) => {
    if (v === 0) return "0"
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`
    return String(Math.round(v))
  }

  const { data: summary, isLoading: sumLoading } = useAnalytics<Summary>("summary", "analytics/summary")
  const { data: trend = [], isLoading: trendLoading } = useAnalytics<CategoryTrendRow[]>("category-trend", "analytics/category-trend")
  const { data: daily = [], isLoading: dailyLoading } = useAnalytics<DailyRow[]>("daily-spending", "analytics/daily-spending")
  const { data: dow = [], isLoading: dowLoading } = useAnalytics<DowRow[]>("dow-pattern", "analytics/dow-pattern")
  const { data: projects = [], isLoading: projLoading } = useAnalytics<ProjectHealth[]>("project-health", "analytics/project-health")
  const { data: radar = [], isLoading: radarLoading } = useAnalytics<RadarRow[]>("category-radar", "analytics/category-radar")

  const dailyFormatted = daily.map(d => ({
    ...d,
    day: (() => { try { return format(parseISO(String(d.day)), "MMM d") } catch { return d.day } })(),
  }))

  const radarMax = Math.max(...radar.map(r => r.total), 1)
  const radarData = radar.map(r => ({ ...r, value: Math.round((r.total / radarMax) * 100) }))

  const isAnyLoading = sumLoading || trendLoading || dailyLoading || dowLoading || projLoading || radarLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deep-dive into your spending patterns, project health, and budget trends
          </p>
        </div>
        {isAnyLoading && (
          <span className="text-xs text-muted-foreground animate-pulse flex-shrink-0">Loading…</span>
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ReceiptText}
          label="Avg Expense"
          value={summary ? fmt(summary.avgExpense) : "—"}
          sub={`${summary?.totalExpenses ?? 0} total transactions`}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Largest Expense"
          value={summary ? fmt(summary.largestExpense) : "—"}
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          icon={Users}
          label="Unique Vendors"
          value={summary ? String(summary.uniqueVendors) : "—"}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={CalendarDays}
          label="Busiest Month"
          value={summary?.hotMonth ?? "—"}
          sub={summary ? fmt(summary.hotMonthTotal) : undefined}
          color="bg-green-500/10 text-green-400"
        />
      </div>

      {/* Category Trend + Day-of-Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Spending by Category — Last 6 Months
            </CardTitle>
            <CardDescription>How your spending composition changes month over month</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.length === 0 && !trendLoading ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={fmtK} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [fmt(v), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {CATEGORIES.map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === CATEGORIES.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Day-of-Week Patterns</CardTitle>
            <CardDescription>Which days generate the most spend</CardDescription>
          </CardHeader>
          <CardContent>
            {dow.length === 0 && !dowLoading ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dow} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={fmtK} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [fmt(v), "Total"]}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {dow.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending Area Chart */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Daily Spending — Last 30 Days</CardTitle>
          <CardDescription>Transaction volume and spend per day to spot peaks and quiet periods</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyFormatted.length === 0 && !dailyLoading ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart data={dailyFormatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={fmtK} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [name === "total" ? fmt(v) : v, name === "total" ? "Amount" : "# Transactions"]}
                />
                <Bar dataKey="count" fill="var(--color-chart-3)" opacity={0.25} radius={[2, 2, 0, 0]} yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={v => String(v)} width={30} />
                <Area type="monotone" dataKey="total" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#areaGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Radar + Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Category Distribution</CardTitle>
            <CardDescription>Radar view of all-time spending balance across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {radarData.length === 0 && !radarLoading ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickFormatter={v => `${v}%`} />
                  <Radar name="Spend" dataKey="value" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(_: unknown, __: string, props: { payload?: RadarRow }) => [fmt(props.payload?.total ?? 0), "Total"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Project Budget Health</CardTitle>
            <CardDescription>Current burn rate and remaining budget per project</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 && !projLoading ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                No projects yet — create one to track budget health
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(p => {
                  const pct = Math.min(p.pctUsed, 100)
                  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-green-500"
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[180px]" title={p.name}>{p.name}</span>
                        <div className="flex items-center gap-3">
                          <HealthBadge pct={p.pctUsed} />
                          <span className="text-muted-foreground text-xs">{p.pctUsed}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {fmt(p.spent)}</span>
                        <span>Budget: {fmt(p.budget)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
