import { useMemo, useState } from "react"
import { useListExpenses, useListProjects } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { CATEGORY_COLORS } from "@/lib/utils"
import { Link } from "wouter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import {
  Building2, Users, Truck, Wrench, ChevronDown, ChevronRight,
  HardHat, Receipt, Layers, Loader2, ArrowRight
} from "lucide-react"

interface GroupRow {
  key: string
  total: number
  count: number
  expenses: any[]
}

function GroupCard({ row, fmt }: { row: GroupRow; fmt: (n: number) => string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="font-semibold text-foreground">{row.key}</span>
          <span className="text-xs text-muted-foreground">({row.count} expense{row.count !== 1 ? 's' : ''})</span>
        </div>
        <span className="font-display font-bold text-lg">{fmt(row.total)}</span>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {row.expenses.map((exp: any) => (
            <div key={exp.id} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[exp.category] }} />
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{exp.vendor || 'Unnamed Vendor'}</span>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 mt-0.5">
                    <span>{format(parseISO(exp.date), 'MMM d, yyyy')}</span>
                    <span>· {exp.projectName}</span>
                    {exp.phaseName && <span>· {exp.phaseName}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <Badge variant="outline" className="text-xs" style={{ color: CATEGORY_COLORS[exp.category], borderColor: CATEGORY_COLORS[exp.category] }}>
                  {exp.category}
                </Badge>
                <span className="font-bold font-display">{fmt(exp.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectJobCard({ project, expenses, fmt }: { project: any; expenses: any[]; fmt: (n: number) => string }) {
  const [open, setOpen] = useState(false)

  const phaseGroups = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number; exps: any[] }> = {}
    for (const e of expenses) {
      const key = e.phaseName || "__none__"
      if (!map[key]) map[key] = { name: e.phaseName || "No phase", total: 0, count: 0, exps: [] }
      map[key].total += e.amount
      map[key].count++
      map[key].exps.push(e)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [expenses])

  const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition-colors">
            {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/projects/${project.id}`} className="font-bold text-foreground hover:text-primary transition-colors">
                {project.name}
              </Link>
              <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-sm border ${STATUS_COLORS[project.status] || ''}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{project.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="font-bold text-sm">{expenses.length}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="font-display font-bold">{fmt(project.totalExpenses)}</p>
          </div>
          <Link href={`/projects/${project.id}`} className="text-primary hover:text-primary/80 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border">
          {phaseGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-4">No expenses yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {phaseGroups.map(pg => (
                <div key={pg.name} className="px-6 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{pg.name}</span>
                      <span className="text-xs text-muted-foreground">({pg.count})</span>
                    </div>
                    <span className="font-display font-bold text-sm">{fmt(pg.total)}</span>
                  </div>
                  <div className="space-y-1 ml-5">
                    {pg.exps.slice(0, 4).map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[e.category] }} />
                          <span>{e.vendor || 'Unnamed'}</span>
                          <span className="hidden sm:inline">· {e.category}</span>
                          {e.crew && <span className="hidden sm:inline">· {e.crew}</span>}
                        </div>
                        <span className="font-medium">{fmt(e.amount)}</span>
                      </div>
                    ))}
                    {pg.exps.length > 4 && (
                      <p className="text-xs text-muted-foreground ml-3">+ {pg.exps.length - 4} more expenses</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Jobs() {
  const { fmt } = useCurrency()
  const { data: projects, isLoading: projLoading } = useListProjects()
  const { data: expenses, isLoading: expLoading } = useListExpenses({})

  const isLoading = projLoading || expLoading

  const projectExpenses = useMemo(() => {
    const map: Record<number, any[]> = {}
    for (const e of expenses || []) {
      if (!map[e.projectId]) map[e.projectId] = []
      map[e.projectId].push(e)
    }
    return map
  }, [expenses])

  const crewGroups: GroupRow[] = useMemo(() => {
    const map: Record<string, GroupRow> = {}
    for (const e of expenses || []) {
      const key = (e as any).crew?.trim() || "Unassigned"
      if (!map[key]) map[key] = { key, total: 0, count: 0, expenses: [] }
      map[key].total += e.amount
      map[key].count++
      map[key].expenses.push(e)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [expenses])

  const vendorGroups: GroupRow[] = useMemo(() => {
    const map: Record<string, GroupRow> = {}
    for (const e of expenses || []) {
      const key = e.vendor?.trim() || "Unknown Vendor"
      if (!map[key]) map[key] = { key, total: 0, count: 0, expenses: [] }
      map[key].total += e.amount
      map[key].count++
      map[key].expenses.push(e)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [expenses])

  const equipmentGroups: GroupRow[] = useMemo(() => {
    const map: Record<string, GroupRow> = {}
    for (const e of expenses || []) {
      const key = (e as any).equipment?.trim() || "Unassigned"
      if (!map[key]) map[key] = { key, total: 0, count: 0, expenses: [] }
      map[key].total += e.amount
      map[key].count++
      map[key].expenses.push(e)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [expenses])

  const totalSpend = useMemo(() => (expenses || []).reduce((s, e) => s + e.amount, 0), [expenses])
  const activeJobs = (projects || []).filter(p => p.status === 'active').length
  const crewCount = crewGroups.filter(g => g.key !== 'Unassigned').length
  const equipCount = equipmentGroups.filter(g => g.key !== 'Unassigned').length

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job & Site Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all projects, phases, crew, vendors and equipment</p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: HardHat, label: "Active Jobs", value: String(activeJobs), sub: `${projects?.length ?? 0} total` },
          { icon: Layers, label: "Total Spend", value: fmt(totalSpend), sub: `${expenses?.length ?? 0} expenses` },
          { icon: Users, label: "Crew Members", value: String(crewCount), sub: "with assignments" },
          { icon: Truck, label: "Equipment Used", value: String(equipCount), sub: "types logged" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label} className="shadow-sm border border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
                <p className="font-display font-bold text-lg leading-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jobs">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="jobs" className="gap-2">
            <HardHat className="w-4 h-4" /> By Job
          </TabsTrigger>
          <TabsTrigger value="crew" className="gap-2">
            <Users className="w-4 h-4" /> By Crew
          </TabsTrigger>
          <TabsTrigger value="vendor" className="gap-2">
            <Receipt className="w-4 h-4" /> By Vendor
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-2">
            <Truck className="w-4 h-4" /> By Equipment
          </TabsTrigger>
        </TabsList>

        {/* By Job */}
        <TabsContent value="jobs" className="space-y-3">
          {projects?.length ? projects.map(project => (
            <ProjectJobCard
              key={project.id}
              project={project}
              expenses={projectExpenses[project.id] || []}
              fmt={fmt}
            />
          )) : (
            <EmptyState icon={HardHat} title="No projects yet" sub="Create a project to start tracking jobs." link="/projects" linkText="Go to Projects" />
          )}
        </TabsContent>

        {/* By Crew */}
        <TabsContent value="crew" className="space-y-3">
          {crewGroups.length ? crewGroups.map(row => (
            <GroupCard key={row.key} row={row} fmt={fmt} />
          )) : (
            <EmptyState icon={Users} title="No crew assigned" sub="Add crew names when logging expenses." link="/add-expense" linkText="Log an Expense" />
          )}
        </TabsContent>

        {/* By Vendor */}
        <TabsContent value="vendor" className="space-y-3">
          {vendorGroups.length ? vendorGroups.map(row => (
            <GroupCard key={row.key} row={row} fmt={fmt} />
          )) : (
            <EmptyState icon={Receipt} title="No vendors recorded" sub="Add vendor names when logging expenses." link="/add-expense" linkText="Log an Expense" />
          )}
        </TabsContent>

        {/* By Equipment */}
        <TabsContent value="equipment" className="space-y-3">
          {equipmentGroups.length ? equipmentGroups.map(row => (
            <GroupCard key={row.key} row={row} fmt={fmt} />
          )) : (
            <EmptyState icon={Truck} title="No equipment logged" sub="Add equipment info when logging expenses." link="/add-expense" linkText="Log an Expense" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub, link, linkText }: {
  icon: any; title: string; sub: string; link: string; linkText: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm mt-1">{sub}</p>
      <Link href={link} className="text-primary text-sm font-medium hover:underline mt-3 inline-block">
        {linkText}
      </Link>
    </div>
  )
}
