import { useMemo, useState } from "react"
import { useListCrew, useCreateCrew, useUpdateCrew, useDeleteCrew, useListProjects, getListCrewQueryKey, type CrewMember } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Trash2, Phone, Briefcase, DollarSign, TrendingUp, Loader2, Pencil, Search, FileText } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, Cell
} from "recharts"

const ROLES = ["laborer", "driver", "supervisor", "mason", "electrician", "plumber", "carpenter", "operator"] as const

const RATE_TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  monthly: "Monthly",
  contractual: "Contractual",
}

const RATE_TYPE_COLORS: Record<string, string> = {
  daily: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  monthly: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  contractual: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
}

const ROLE_COLORS: Record<string, string> = {
  laborer: "bg-slate-100 text-slate-700",
  driver: "bg-blue-100 text-blue-700",
  supervisor: "bg-purple-100 text-purple-700",
  mason: "bg-orange-100 text-orange-700",
  electrician: "bg-yellow-100 text-yellow-700",
  plumber: "bg-cyan-100 text-cyan-700",
  carpenter: "bg-amber-100 text-amber-700",
  operator: "bg-green-100 text-green-700",
}

interface FormState {
  name: string
  role: string
  rate: string
  rateType: "daily" | "monthly" | "contractual"
  phone: string
  projectId: string
  status: string
}

function emptyForm(): FormState {
  return { name: "", role: "laborer", rate: "", rateType: "daily", phone: "", projectId: "none", status: "active" }
}

export default function CrewPage() {
  const { fmt } = useCurrency()
  const { data: crew, isLoading } = useListCrew()
  const { data: projects } = useListProjects()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CrewMember | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCrewQueryKey() })

  const createMut = useCreateCrew({
    mutation: {
      onSuccess: () => { invalidate(); setOpen(false); setForm(emptyForm()); toast({ title: "Crew member added" }) },
      onError: (e: any) => toast({ title: "Failed to add", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })
  const updateMut = useUpdateCrew({
    mutation: {
      onSuccess: () => { invalidate(); setOpen(false); setEditing(null); setForm(emptyForm()); toast({ title: "Updated" }) },
      onError: (e: any) => toast({ title: "Update failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })
  const deleteMut = useDeleteCrew({
    mutation: {
      onSuccess: () => { invalidate(); toast({ title: "Removed" }) },
      onError: (e: any) => toast({ title: "Delete failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })

  const handleOpenAdd = () => { setEditing(null); setForm(emptyForm()); setOpen(true) }
  const handleEdit = (c: CrewMember) => {
    setEditing(c)
    setForm({
      name: c.name,
      role: c.role,
      rate: String(c.rate ?? 0),
      rateType: (c.rateType as FormState["rateType"]) || "daily",
      phone: c.phone ?? "",
      projectId: c.projectId ? String(c.projectId) : "none",
      status: c.status,
    })
    setOpen(true)
  }

  const submit = () => {
    const payload = {
      name: form.name.trim(),
      role: form.role,
      rate: Number(form.rate) || 0,
      rateType: form.rateType,
      phone: form.phone.trim() || null,
      projectId: form.projectId === "none" ? null : Number(form.projectId),
      status: form.status,
    }
    if (!payload.name) { toast({ title: "Name is required", variant: "destructive" }); return }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate({ data: payload })
  }

  const totalCrew = crew?.length ?? 0
  const activeCount = crew?.filter(c => c.status === "active").length ?? 0
  const totalLaborCost = crew?.reduce((sum, c) => sum + (c.laborCost ?? 0), 0) ?? 0

  // Separate rate summaries per type (only active workers)
  const activeCrew = crew?.filter(c => c.status === "active") ?? []
  const dailyTotal   = activeCrew.filter(c => c.rateType === "daily").reduce((s, c) => s + (c.rate ?? 0), 0)
  const monthlyTotal = activeCrew.filter(c => c.rateType === "monthly").reduce((s, c) => s + (c.rate ?? 0), 0)
  const contractTotal = activeCrew.filter(c => c.rateType === "contractual").reduce((s, c) => s + (c.rate ?? 0), 0)
  const dailyCount    = activeCrew.filter(c => c.rateType === "daily").length
  const monthlyCount  = activeCrew.filter(c => c.rateType === "monthly").length
  const contractCount = activeCrew.filter(c => c.rateType === "contractual").length

  const chartData = useMemo(
    () =>
      (crew ?? [])
        .filter(c => (c.laborCost ?? 0) > 0)
        .sort((a, b) => (b.laborCost ?? 0) - (a.laborCost ?? 0))
        .slice(0, 8)
        .map(c => ({ name: c.name || "Unknown", cost: c.laborCost ?? 0 })),
    [crew]
  )

  const filtered = useMemo(() => {
    if (!crew) return []
    return crew.filter(c => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.role ?? "").toLowerCase().includes(q)
      const matchStatus = filterStatus === "all" || c.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [crew, search, filterStatus])

  const stat = (label: string, value: string, icon: React.ReactNode, iconBg: string, iconColor: string) => (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} self-start`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-1 truncate">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Crew Management</h2>
          <p className="text-muted-foreground">Track workers, rates, and labor costs by person</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(emptyForm()) } }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd} className="font-bold gap-2"><Plus className="w-4 h-4" /> Add Crew Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Crew Member" : "Add Crew Member"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahmed Khan" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rate Type</Label>
                  <Select value={form.rateType} onValueChange={(v: FormState["rateType"]) => setForm({ ...form, rateType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="contractual">Contractual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rate (PKR)</Label>
                  <Input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92..." /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Assigned Project (optional)</Label>
                <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Unassigned —</SelectItem>
                    {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Save Changes" : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards – 6 cards showing all three rate types + totals */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stat("Total Crew", String(totalCrew), <Users className="w-5 h-5" />, "bg-orange-50 dark:bg-orange-900/20", "text-primary")}
        {stat("Active", String(activeCount), <Briefcase className="w-5 h-5" />, "bg-emerald-50 dark:bg-emerald-900/20", "text-emerald-600")}
        {stat(
          `Daily Rate · ${dailyCount} workers`,
          dailyCount > 0 ? fmt(dailyTotal) + "/day" : "—",
          <DollarSign className="w-5 h-5" />, "bg-blue-50 dark:bg-blue-900/20", "text-blue-600"
        )}
        {stat(
          `Monthly · ${monthlyCount} workers`,
          monthlyCount > 0 ? fmt(monthlyTotal) + "/mo" : "—",
          <DollarSign className="w-5 h-5" />, "bg-purple-50 dark:bg-purple-900/20", "text-purple-600"
        )}
        {stat(
          `Contractual · ${contractCount} workers`,
          contractCount > 0 ? fmt(contractTotal) : "—",
          <FileText className="w-5 h-5" />, "bg-amber-50 dark:bg-amber-900/20", "text-amber-600"
        )}
        {stat("Total Labor Cost", fmt(totalLaborCost), <TrendingUp className="w-5 h-5" />, "bg-rose-50 dark:bg-rose-900/20", "text-rose-600")}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-sm font-semibold mb-4">Top Workers by Labor Cost</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 80 }}>
              <XAxis type="number" tickFormatter={v => fmt(v)} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
              <RTooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center text-sm text-muted-foreground">{filtered.length} members</span>
      </div>

      {/* Excel-like Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Rate Type</TableHead>
              <TableHead className="font-semibold text-right">Rate</TableHead>
              <TableHead className="font-semibold text-right">Unit</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold text-right">Labor Cost</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Date Added</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="w-8 h-8 opacity-20" />
                    <span className="text-sm">{crew?.length === 0 ? "No crew members yet. Add your first worker." : "No members match filters."}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(c => {
                const project = projects?.find(p => p.id === c.projectId)
                const isActive = c.status === "active"
                const rateTypeKey = c.rateType || "daily"
                const rateUnit = rateTypeKey === "daily" ? "/day" : rateTypeKey === "monthly" ? "/month" : "(contract)"
                const dateAdded = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                  : "—"
                return (
                  <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(c.name ?? "U")
                            .split(" ")
                            .map(p => p[0] ?? "")
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${ROLE_COLORS[c.role] ?? "bg-slate-100 text-slate-700"}`}>
                        {c.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${RATE_TYPE_COLORS[rateTypeKey] ?? ""}`}>
                        {RATE_TYPE_LABELS[rateTypeKey] ?? rateTypeKey}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{fmt(c.rate ?? 0)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{rateUnit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span> : <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                      {project?.name ?? <span className="text-muted-foreground/40">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">{fmt(c.laborCost ?? 0)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{dateAdded}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(c)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`Remove ${c.name}?`)) deleteMut.mutate({ id: c.id }) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
