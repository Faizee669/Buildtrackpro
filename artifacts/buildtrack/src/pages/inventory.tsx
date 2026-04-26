import { useMemo, useState } from "react"
import { useListInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useListProjects, getListInventoryQueryKey, type InventoryItem } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Trash2, AlertTriangle, Loader2, Pencil, Layers, Boxes, Search } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

const UNITS = ["bags", "kg", "tons", "liters", "units", "meters", "ft", "pieces", "rolls", "sheets"] as const

interface FormState {
  name: string; unit: string; quantity: string; costPerUnit: string;
  reorderLevel: string; vendor: string; projectId: string;
}
const empty = (): FormState => ({ name: "", unit: "bags", quantity: "0", costPerUnit: "0", reorderLevel: "0", vendor: "", projectId: "none" })

export default function InventoryPage() {
  const { fmt } = useCurrency()
  const { data: items, isLoading } = useListInventory()
  const { data: projects } = useListProjects()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState<FormState>(empty())
  const [search, setSearch] = useState("")
  const [filterStock, setFilterStock] = useState("all")

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() })
  const createMut = useCreateInventory({
    mutation: {
      onSuccess: () => { invalidate(); setOpen(false); setForm(empty()); toast({ title: "Item added" }) },
      onError: (e: any) => toast({ title: "Failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })
  const updateMut = useUpdateInventory({
    mutation: {
      onSuccess: () => { invalidate(); setOpen(false); setEditing(null); setForm(empty()); toast({ title: "Updated" }) },
      onError: (e: any) => toast({ title: "Update failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })
  const deleteMut = useDeleteInventory({
    mutation: {
      onSuccess: () => { invalidate(); toast({ title: "Removed" }) },
      onError: (e: any) => toast({ title: "Delete failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  })

  const handleAdd = () => { setEditing(null); setForm(empty()); setOpen(true) }
  const handleEdit = (it: InventoryItem) => {
    setEditing(it)
    setForm({
      name: it.name, unit: it.unit,
      quantity: String(it.quantity), costPerUnit: String(it.costPerUnit),
      reorderLevel: String(it.reorderLevel), vendor: it.vendor ?? "",
      projectId: it.projectId ? String(it.projectId) : "none",
    })
    setOpen(true)
  }

  const submit = () => {
    const payload = {
      name: form.name.trim(),
      unit: form.unit,
      quantity: Number(form.quantity) || 0,
      costPerUnit: Number(form.costPerUnit) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      vendor: form.vendor.trim() || null,
      projectId: form.projectId === "none" ? null : Number(form.projectId),
    }
    if (!payload.name) { toast({ title: "Name required", variant: "destructive" }); return }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate({ data: payload })
  }

  const totalValue = items?.reduce((s, i) => s + i.totalValue, 0) ?? 0
  const totalSkus = items?.length ?? 0
  const lowStock = items?.filter(i => i.isLow).length ?? 0
  const topItem = useMemo(() => [...(items ?? [])].sort((a, b) => b.totalValue - a.totalValue)[0], [items])

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter(it => {
      const matchSearch = !search || it.name.toLowerCase().includes(search.toLowerCase()) || (it.vendor ?? "").toLowerCase().includes(search.toLowerCase())
      const matchStock = filterStock === "all" || (filterStock === "low" && it.isLow) || (filterStock === "ok" && !it.isLow)
      return matchSearch && matchStock
    })
  }, [items, search, filterStock])

  const stat = (label: string, value: string, sub: string | null, icon: React.ReactNode, iconBg: string, iconColor: string, valueColor = "") => (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} self-start`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 truncate ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Material Inventory</h2>
          <p className="text-muted-foreground">Track stock levels, costs, and reorder thresholds</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty()) } }}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="font-bold gap-2"><Plus className="w-4 h-4" /> Add Material</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Material" : "Add Material"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Material Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cement" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                <div>
                  <Label>Unit</Label>
                  <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cost per Unit (PKR)</Label><Input type="number" step="0.01" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} /></div>
                <div><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} /></div>
              </div>
              <div><Label>Vendor (optional)</Label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Supplier name" /></div>
              <div>
                <Label>Project (optional)</Label>
                <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Shared / Warehouse —</SelectItem>
                    {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stat("Total Items", String(totalSkus), null, <Boxes className="w-5 h-5" />, "bg-orange-50 dark:bg-orange-900/20", "text-primary")}
        {stat("Inventory Value", fmt(totalValue), null, <Layers className="w-5 h-5" />, "bg-amber-50 dark:bg-amber-900/20", "text-amber-600")}
        {stat("Low Stock", String(lowStock), lowStock > 0 ? "Reorder needed" : "All stocked", <AlertTriangle className="w-5 h-5" />, lowStock > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20", lowStock > 0 ? "text-destructive" : "text-emerald-600", lowStock > 0 ? "text-destructive" : "")}
        {stat("Top Material", topItem?.name ?? "—", topItem ? fmt(topItem.totalValue) : null, <Package className="w-5 h-5" />, "bg-purple-50 dark:bg-purple-900/20", "text-purple-600")}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or vendor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="ok">In Stock</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center text-sm text-muted-foreground">{filtered.length} items</span>
      </div>

      {/* Excel-like Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Material</TableHead>
              <TableHead className="font-semibold text-right">Quantity</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold text-right">Cost/Unit</TableHead>
              <TableHead className="font-semibold text-right">Reorder At</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold text-right">Total Value</TableHead>
              <TableHead className="font-semibold text-center">Stock</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="w-8 h-8 opacity-20" />
                    <span className="text-sm">{items?.length === 0 ? "No materials tracked yet. Add your first item." : "No items match filters."}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(it => {
                const project = projects?.find(p => p.id === it.projectId)
                const stockPct = it.reorderLevel > 0 ? Math.min(100, (it.quantity / it.reorderLevel) * 100) : 100
                return (
                  <TableRow key={it.id} className={`hover:bg-muted/30 transition-colors ${it.isLow ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${it.isLow ? "bg-red-50 text-destructive" : "bg-orange-50 text-primary"}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground">{it.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      <span className={it.isLow ? "text-destructive" : ""}>{it.quantity.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{it.unit}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(it.costPerUnit)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{it.reorderLevel > 0 ? it.reorderLevel.toLocaleString() : <span className="text-muted-foreground/30">—</span>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{it.vendor ?? <span className="text-muted-foreground/30">—</span>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {project?.name ?? <span className="text-muted-foreground/30">Shared</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">{fmt(it.totalValue)}</TableCell>
                    <TableCell className="text-center">
                      {it.isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-red-50 text-destructive dark:bg-red-900/30">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          OK
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(it)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`Delete ${it.name}?`)) deleteMut.mutate({ id: it.id }) }}>
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
