import { useMemo, useState } from "react"
import { useListCrew, useCreateCrew, useUpdateCrew, useDeleteCrew, useListProjects, getListCrewQueryKey, type CrewMember } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Phone, Briefcase, DollarSign, TrendingUp, Loader2, Pencil } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, Cell } from "recharts"

const ROLES = ["laborer", "driver", "supervisor", "mason", "electrician", "plumber", "carpenter", "operator"] as const

const ROLE_COLORS: Record<string, string> = {
  laborer: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  driver: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  supervisor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  mason: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  electrician: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  plumber: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  carpenter: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  operator: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
}

interface FormState {
  name: string
  role: string
  dailyRate: string
  phone: string
  projectId: string
  status: string
}

function emptyForm(): FormState {
  return { name: "", role: "laborer", dailyRate: "", phone: "", projectId: "none", status: "active" }
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCrewQueryKey() })

  const createMut = useCreateCrew({ mutation: { onSuccess: () => { invalidate(); setOpen(false); setForm(emptyForm()); toast({ title: "Crew member added" }) }, onError: (e: any) => toast({ title: "Failed", description: e?.error || "Unknown", variant: "destructive" }) } })
  const updateMut = useUpdateCrew({ mutation: { onSuccess: () => { invalidate(); setOpen(false); setEditing(null); setForm(emptyForm()); toast({ title: "Updated" }) }, onError: (e: any) => toast({ title: "Update failed", description: e?.error || "Unknown error", variant: "destructive" }) } })
  const deleteMut = useDeleteCrew({ mutation: { onSuccess: () => { invalidate(); toast({ title: "Removed" }) }, onError: (e: any) => toast({ title: "Delete failed", description: e?.error || "Unknown error", variant: "destructive" }) } })

  const handleOpenAdd = () => { setEditing(null); setForm(emptyForm()); setOpen(true) }
  const handleEdit = (c: CrewMember) => {
    setEditing(c)
    setForm({
      name: c.name,
      role: c.role,
      dailyRate: String(c.dailyRate),
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
      dailyRate: Number(form.dailyRate) || 0,
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
  const totalDailyRate = crew?.reduce((sum, c) => sum + c.dailyRate, 0) ?? 0
  const totalLaborCost = crew?.reduce((sum, c) => sum + c.laborCost, 0) ?? 0

  const chartData = useMemo(
    () => (crew ?? []).filter(c => c.laborCost > 0).sort((a, b) => b.laborCost - a.laborCost).slice(0, 8).map(c => ({ name: c.name, cost: c.laborCost })),
    [crew]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Crew Management</h2>
          <p className="text-muted-foreground">Track workers, daily rates, and labor costs by person</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(emptyForm()) } }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd} className="font-bold gap-2"><Plus className="w-4 h-4" /> Add Crew Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Crew Member" : "Add Crew Member"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahmed Khan" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Daily Rate</Label><Input type="number" value={form.dailyRate} onChange={e => setForm({ ...form, dailyRate: e.target.value })} placeholder="0" /></div>
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
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save Changes" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      {(() => {
        const stat = (label: string, value: string, icon: React.ReactNode, iconBg: string, iconColor: string) => (
          <div className="bg-card p-5 rounded-2xl border border-card-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold mt-1 truncate">{value}</p>
            </div>
          </div>
        )
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stat("Total Crew", String(totalCrew), <Users className="w-5 h-5" />, "bg-orange-50", "text-primary")}
            {stat("Active", String(activeCount), <Briefcase className="w-5 h-5" />, "bg-emerald-50", "text-emerald-600")}
            {stat("Daily Wage Bill", fmt(totalDailyRate), <DollarSign className="w-5 h-5" />, "bg-amber-50", "text-amber-600")}
            {stat("Labor Spent", fmt(totalLaborCost), <TrendingUp className="w-5 h-5" />, "bg-blue-50", "text-blue-600")}
          </div>
        )
      })()}

      {/* Top workers chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Top Workers by Labor Cost</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                <XAxis type="number" tickFormatter={v => fmt(v)} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <RTooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Crew list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Personnel</h2>
          <span className="text-xs text-muted-foreground">{crew?.length ?? 0} members</span>
        </div>
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : crew?.length === 0 ? (
          <div className="bg-card rounded-2xl border border-card-border p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No crew members yet</p>
            <p className="text-sm text-muted-foreground">Add your first worker to start tracking labor costs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {crew?.map(c => {
              const project = projects?.find(p => p.id === c.projectId)
              const isActive = c.status === "active"
              return (
                <div key={c.id} className="bg-card rounded-2xl p-4 border border-card-border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">
                        {c.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">{c.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{c.role}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                          {project && <span className="truncate">· {project.name}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-card-border">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Daily Rate</p>
                      <p className="text-sm font-bold text-foreground">{fmt(c.dailyRate)}/day</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Cost</p>
                      <p className="text-sm font-bold text-primary">{fmt(c.laborCost)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-card-border -mx-1">
                    <Badge className={`${ROLE_COLORS[c.role] || ROLE_COLORS.laborer} border-0 capitalize text-[10px]`}>{c.role}</Badge>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Remove ${c.name}?`)) deleteMut.mutate({ id: c.id }) }} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
