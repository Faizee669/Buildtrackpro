import { useRoute, Link } from "wouter"
import {
  useGetProject, useListExpenses, useUpdateProject, useDeleteProject,
  useListPhases, useCreatePhase, useUpdatePhase, useDeletePhase,
  getListProjectsQueryKey, getGetProjectQueryKey, getListPhasesQueryKey,
} from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, startOfWeek, differenceInDays } from "date-fns"
import {
  ArrowLeft, Edit, Trash2, Receipt, AlertTriangle, Loader2, Plus, Layers,
  TrendingUp, TrendingDown, DollarSign, Hammer, Calendar, MapPin, BarChart2,
  Share2, Copy, Check, Link2Off,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
}
const STATUS_LABEL = { active: "Active", completed: "Completed", on_hold: "On Hold" }

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold"]),
})

const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold"]),
})

function KpiChip({ label, value, sub, highlight, icon: Icon }: {
  label: string
  value: string
  sub?: string
  highlight?: "danger" | "success" | "warn"
  icon?: React.ElementType
}) {
  const colors = {
    danger: "text-destructive",
    success: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-500",
  }
  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground tracking-wide truncate">{label}</p>
            <p className={`text-lg sm:text-2xl font-display font-bold mt-1 truncate ${highlight ? colors[highlight] : ""}`}>{value}</p>
            {sub && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
          </div>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/50 flex-shrink-0 mt-1" />}
        </div>
      </CardContent>
    </Card>
  )
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "0.35rem",
  fontSize: "0.8rem",
}

export default function ProjectDetails() {
  const { fmt } = useCurrency()
  const [, params] = useRoute("/projects/:id")
  const projectId = parseInt(params?.id || "0", 10)

  const { data: project, isLoading: projLoading } = useGetProject(projectId)
  const { data: expenses, isLoading: expLoading } = useListExpenses({ projectId })
  const { data: phases, isLoading: phasesLoading } = useListPhases(projectId)

  const [editOpen, setEditOpen] = useState(false)
  const [addPhaseOpen, setAddPhaseOpen] = useState(false)
  const [editPhaseId, setEditPhaseId] = useState<number | null>(null)
  const [expenseSearch, setExpenseSearch] = useState("")
  const [expenseCatFilter, setExpenseCatFilter] = useState("all")
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleGenerateShare = async () => {
    setShareLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, { method: "POST", credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setShareToken(data.shareToken)
        setShareOpen(true)
      }
    } finally {
      setShareLoading(false)
    }
  }

  const handleRevokeShare = async () => {
    await fetch(`/api/projects/${projectId}/share`, { method: "DELETE", credentials: "include" })
    setShareToken(null)
    setShareOpen(false)
    toast({ title: "Share link revoked" })
  }

  const shareUrl = shareToken
    ? `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/share/${shareToken}`
    : ""

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) })
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() })
    queryClient.invalidateQueries({ queryKey: getListPhasesQueryKey(projectId) })
  }

  const updateProject = useUpdateProject({
    mutation: {
      onSuccess: () => { invalidate(); setEditOpen(false); toast({ title: "Project updated" }) }
    }
  })

  const deleteProject = useDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() })
        toast({ title: "Project deleted" })
        window.location.href = "/projects"
      }
    }
  })

  const createPhase = useCreatePhase({
    mutation: {
      onSuccess: () => { invalidate(); setAddPhaseOpen(false); phaseForm.reset({ name: "", description: "", status: "active" }); toast({ title: "Phase added" }) },
      onError: (e: any) => toast({ title: "Failed to add phase", description: e?.error, variant: "destructive" })
    }
  })

  const updatePhase = useUpdatePhase({
    mutation: {
      onSuccess: () => { invalidate(); setEditPhaseId(null); toast({ title: "Phase updated" }) },
      onError: (e: any) => toast({ title: "Failed to update phase", description: e?.error, variant: "destructive" })
    }
  })

  const deletePhase = useDeletePhase({
    mutation: {
      onSuccess: () => { invalidate(); toast({ title: "Phase deleted" }) },
      onError: (e: any) => toast({ title: "Failed to delete phase", description: e?.error, variant: "destructive" })
    }
  })

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    values: project ? {
      name: project.name,
      description: project.description || "",
      budget: project.budget,
      startDate: project.startDate,
      status: project.status as any,
    } : undefined,
  })

  const phaseForm = useForm<z.infer<typeof phaseSchema>>({
    resolver: zodResolver(phaseSchema),
    defaultValues: { name: "", description: "", status: "active" },
  })

  const editPhaseForm = useForm<z.infer<typeof phaseSchema>>({
    resolver: zodResolver(phaseSchema),
    defaultValues: { name: "", description: "", status: "active" },
  })

  /* ── Derived chart data ── */
  const { trendData, catData, allCategories } = useMemo(() => {
    if (!expenses) return { trendData: [], catData: [], allCategories: [] }

    /* Weekly spending trend */
    const weekMap: Record<string, number> = {}
    for (const e of expenses) {
      const key = format(startOfWeek(parseISO(e.date), { weekStartsOn: 1 }), "MMM d")
      weekMap[key] = (weekMap[key] || 0) + e.amount
    }
    const trendData = Object.entries(weekMap)
      .sort((a, b) => new Date("2024 " + a[0]).getTime() - new Date("2024 " + b[0]).getTime())
      .map(([week, amount]) => ({ week, amount }))

    /* Category totals */
    const catMap: Record<string, number> = {}
    for (const e of expenses) catMap[e.category] = (catMap[e.category] || 0) + e.amount
    const total = Object.values(catMap).reduce((s, v) => s + v, 0)
    const catData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
        fill: CATEGORY_COLORS[name] || "hsl(var(--primary))",
      }))

    const allCategories = Object.keys(catMap)

    return { trendData, catData, allCategories }
  }, [expenses])

  /* Budget allocation donut */
  const budgetDonutData = useMemo(() => {
    if (!project) return []
    const items = [
      { name: "Labor Spent", value: project.laborSpent, fill: "#f97316" },
      { name: "Material Spent", value: project.materialSpent, fill: "#3b82f6" },
      { name: "Remaining", value: Math.max(0, project.remainingBudget), fill: "hsl(var(--secondary))" },
    ].filter(d => d.value > 0)
    return items
  }, [project])

  /* Phase spend donut */
  const phaseDonutData = useMemo(() => {
    if (!phases) return []
    return phases
      .filter(p => p.totalExpenses > 0)
      .map((p, i) => ({
        name: p.name,
        value: p.totalExpenses,
        fill: ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#facc15"][i % 6],
      }))
  }, [phases])

  /* Filtered expenses */
  const filteredExpenses = useMemo(() => {
    if (!expenses) return []
    return expenses.filter(e => {
      const matchesCat = expenseCatFilter === "all" || e.category === expenseCatFilter
      const q = expenseSearch.toLowerCase()
      const matchesSearch = !q || e.vendor?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [expenses, expenseCatFilter, expenseSearch])

  if (projLoading || expLoading || phasesLoading) return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Link>
      </div>
      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
    </div>
  )

  if (!project) return (
    <div className="space-y-6">
      <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> All Projects
      </Link>
      <p className="text-muted-foreground">Project not found.</p>
    </div>
  )

  const pct = project.budget > 0 ? (project.totalExpenses / project.budget) * 100 : 0
  const isOverBudget = project.totalExpenses > project.budget
  const daysActive = differenceInDays(new Date(), parseISO(project.startDate))
  const dailyBurn = daysActive > 0 ? project.totalExpenses / daysActive : 0
  const hasRevenue = project.estimatedRevenue > 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors hover-elevate mt-1">
          <ArrowLeft className="w-4 h-4" /> Projects
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
            <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-sm border flex-shrink-0 ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
              {project.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            {project.description && <span className="truncate">{project.description}</span>}
            {project.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Started {format(parseISO(project.startDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {/* Share button + dialog */}
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover-elevate gap-2"
                onClick={(e) => { if (!shareToken) { e.preventDefault(); handleGenerateShare() } }}
                disabled={shareLoading}
              >
                {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Project Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can view a read-only snapshot of this project's finances.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-mono focus:outline-none truncate"
                  />
                  <Button size="sm" onClick={copyShareLink} className="flex-shrink-0 gap-1.5">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="pt-2 border-t border-card-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
                    onClick={handleRevokeShare}
                  >
                    <Link2Off className="w-4 h-4" /> Revoke Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover-elevate">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(d => updateProject.mutate({ id: projectId, data: d }))} className="space-y-4">
                  <FormField control={projectForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={projectForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={projectForm.control} name="budget" render={({ field }) => (
                      <FormItem><FormLabel>Budget</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={projectForm.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={projectForm.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={updateProject.isPending}>Save Changes</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm("Delete this project? All expenses will be removed.")) deleteProject.mutate({ id: projectId })
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiChip
          label="Budget Used"
          value={`${pct.toFixed(1)}%`}
          sub={`${fmt(project.totalExpenses)} of ${fmt(project.budget)}`}
          highlight={isOverBudget ? "danger" : pct > 80 ? "warn" : undefined}
          icon={DollarSign}
        />
        <KpiChip
          label="Remaining"
          value={fmt(Math.abs(project.remainingBudget))}
          sub={isOverBudget ? "OVER BUDGET" : "left to spend"}
          highlight={isOverBudget ? "danger" : project.remainingBudget < project.budget * 0.1 ? "warn" : "success"}
          icon={isOverBudget ? TrendingDown : TrendingUp}
        />
        <KpiChip
          label="Labor Spent"
          value={fmt(project.laborSpent)}
          sub={project.laborBudget > 0 ? `of ${fmt(project.laborBudget)} budget` : `${project.totalExpenses > 0 ? ((project.laborSpent / project.totalExpenses) * 100).toFixed(0) : 0}% of total`}
          icon={Hammer}
        />
        <KpiChip
          label="Material Spent"
          value={fmt(project.materialSpent)}
          sub={`${project.totalExpenses > 0 ? ((project.materialSpent / project.totalExpenses) * 100).toFixed(0) : 0}% of total`}
          icon={BarChart2}
        />
        {hasRevenue ? (
          <KpiChip
            label="Profit Margin"
            value={`${project.profitMargin.toFixed(1)}%`}
            sub={`${fmt(project.profit)} profit`}
            highlight={project.profitMargin < 0 ? "danger" : project.profitMargin < 10 ? "warn" : "success"}
            icon={project.profitMargin >= 0 ? TrendingUp : TrendingDown}
          />
        ) : (
          <KpiChip
            label="Daily Burn"
            value={fmt(dailyBurn)}
            sub="avg per day"
            icon={TrendingUp}
          />
        )}
        <KpiChip
          label="Days Active"
          value={String(Math.max(0, daysActive))}
          sub={`since ${format(parseISO(project.startDate), "MMM d, yyyy")}`}
          icon={Calendar}
        />
      </div>

      {/* ── Budget progress bar ── */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm font-medium">
          <span>Budget Utilization</span>
          <span className={isOverBudget ? "text-destructive font-bold" : ""}>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary/20 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isOverBudget ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <p className="text-destructive text-xs flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> This project has exceeded its budget by {fmt(project.totalExpenses - project.budget)}.
          </p>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2"><BarChart2 className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="phases" className="gap-2"><Layers className="w-4 h-4" /> Phases <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{phases?.length ?? 0}</span></TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2"><Receipt className="w-4 h-4" /> Expenses <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{expenses?.length ?? 0}</span></TabsTrigger>
        </TabsList>

        {/* ── Overview tab ── */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly spend trend */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold">Weekly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 100000 ? (v / 100000).toFixed(1) + "L" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}`} />
                      <RTooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(v: number) => [fmt(v), "Spent"]}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No expenses recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category breakdown – horizontal bars */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {catData.length > 0 ? (
                  <div className="space-y-2.5">
                    {catData.map(d => (
                      <div key={d.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                            <span className="font-medium truncate max-w-[120px]">{d.name}</span>
                          </div>
                          <span className="text-muted-foreground font-medium">{fmt(d.value)} <span className="opacity-60">({d.pct}%)</span></span>
                        </div>
                        <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, backgroundColor: d.fill }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No expenses recorded yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget allocation donut */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold">Budget Allocation</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center">
                {budgetDonutData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={budgetDonutData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={78}
                          paddingAngle={2} dataKey="value" stroke="none"
                        >
                          {budgetDonutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <RTooltip
                          contentStyle={CHART_TOOLTIP_STYLE}
                          formatter={(v: number) => fmt(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2 mt-1">
                      {budgetDonutData.map(d => (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                          <span className="font-semibold">{fmt(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No spending data yet.</div>
                )}
              </CardContent>
            </Card>

            {/* Phase spend breakdown */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold">Phase Spending</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {phaseDonutData.length > 0 ? (
                  <div className="space-y-2.5">
                    {phaseDonutData.map(d => {
                      const phasePct = project.totalExpenses > 0 ? (d.value / project.totalExpenses) * 100 : 0
                      return (
                        <div key={d.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                              <span className="font-medium truncate max-w-[120px]">{d.name}</span>
                            </div>
                            <span className="text-muted-foreground font-medium">{fmt(d.value)} <span className="opacity-60">({phasePct.toFixed(1)}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${phasePct}%`, backgroundColor: d.fill }} />
                          </div>
                        </div>
                      )
                    })}
                    {phases && phases.filter(p => p.totalExpenses === 0).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{phases.filter(p => p.totalExpenses === 0).length} phase(s) with no spending</p>
                    )}
                  </div>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                    {phases?.length ? "No phase expenses recorded yet." : "No phases defined yet."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Phases tab ── */}
        <TabsContent value="phases" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{phases?.length ?? 0} phase{phases?.length !== 1 ? "s" : ""} defined</p>
            <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 font-semibold">
                  <Plus className="w-4 h-4" /> Add Phase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle>Add Phase / Sub-Site</DialogTitle></DialogHeader>
                <Form {...phaseForm}>
                  <form onSubmit={phaseForm.handleSubmit(d => createPhase.mutate({ projectId, data: d }))} className="space-y-4 pt-1">
                    <FormField control={phaseForm.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Phase Name</FormLabel><FormControl><Input placeholder="e.g. Foundation, Framing, Electrical…" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={phaseForm.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Input placeholder="Short description" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={phaseForm.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full font-bold" disabled={createPhase.isPending}>
                      {createPhase.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding…</> : "Add Phase"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {phases?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map(phase => (
                <Card key={phase.id} className="shadow-sm border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{phase.name}</p>
                        {phase.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{phase.description}</p>}
                      </div>
                      <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-sm border flex-shrink-0 ${STATUS_COLORS[phase.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABEL[phase.status as keyof typeof STATUS_LABEL]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-bold text-sm">{fmt(phase.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expenses</p>
                        <p className="font-bold text-sm">{phase.expenseCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Dialog open={editPhaseId === phase.id} onOpenChange={open => {
                        if (open) {
                          setEditPhaseId(phase.id)
                          editPhaseForm.reset({ name: phase.name, description: phase.description || "", status: phase.status as any })
                        } else setEditPhaseId(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader><DialogTitle>Edit Phase</DialogTitle></DialogHeader>
                          <Form {...editPhaseForm}>
                            <form onSubmit={editPhaseForm.handleSubmit(d => updatePhase.mutate({ id: phase.id, data: d }))} className="space-y-4 pt-1">
                              <FormField control={editPhaseForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Phase Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={editPhaseForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={editPhaseForm.control} name="status" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="on_hold">On Hold</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <Button type="submit" className="w-full" disabled={updatePhase.isPending}>Save</Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Delete phase "${phase.name}"? Expenses assigned to it won't be deleted.`))
                            deletePhase.mutate({ id: phase.id })
                        }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No phases defined yet</p>
              <p className="text-sm mt-1">Break this project into phases like Foundation, Framing, Electrical…</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setAddPhaseOpen(true)}>
                <Plus className="w-4 h-4" /> Add First Phase
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Expenses tab ── */}
        <TabsContent value="expenses" className="mt-0">
          <div className="flex flex-wrap gap-3 mb-4">
            <Input
              placeholder="Search vendor, category, notes…"
              value={expenseSearch}
              onChange={e => setExpenseSearch(e.target.value)}
              className="h-9 w-full sm:w-64"
            />
            <Select value={expenseCatFilter} onValueChange={setExpenseCatFilter}>
              <SelectTrigger className="h-9 w-full sm:w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {(expenseSearch || expenseCatFilter !== "all") && (
              <Button variant="ghost" size="sm" className="h-9" onClick={() => { setExpenseSearch(""); setExpenseCatFilter("all") }}>
                Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground self-center">{filteredExpenses.length} of {expenses?.length ?? 0}</span>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {filteredExpenses.length ? (
              <div className="divide-y divide-border">
                {filteredExpenses.map(expense => (
                  <div key={expense.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-secondary/10 text-secondary-foreground border border-secondary/20">
                        <Receipt className="w-5 h-5" style={{ color: CATEGORY_COLORS[expense.category] }} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{expense.vendor || "Unnamed Vendor"}</p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                          <span>{format(parseISO(expense.date), "MMM d, yyyy")}</span>
                          {(expense as any).phaseName && <><span>•</span><span className="font-medium text-foreground/70">{(expense as any).phaseName}</span></>}
                          {(expense as any).crew && <><span>•</span><span>Crew: {(expense as any).crew}</span></>}
                          {(expense as any).equipment && <><span>•</span><span>Equip: {(expense as any).equipment}</span></>}
                          {expense.notes && <><span>•</span><span>{expense.notes}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                      <span className="text-lg font-display font-bold">{fmt(expense.amount)}</span>
                      <Badge variant="outline" style={{ color: CATEGORY_COLORS[expense.category], borderColor: CATEGORY_COLORS[expense.category] }}>
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                {expenses?.length ? (
                  <p>No expenses match your filters.</p>
                ) : (
                  <>
                    <p>No expenses recorded for this project.</p>
                    <Link href="/add-expense" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                      + Add your first expense
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
