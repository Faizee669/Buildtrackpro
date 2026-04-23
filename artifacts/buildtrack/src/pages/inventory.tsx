import { useMemo, useState } from "react"
import { useListInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useListProjects, getListInventoryQueryKey, type InventoryItem } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Trash2, AlertTriangle, Loader2, Pencil, Layers, Boxes } from "lucide-react"
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() })
  const createMut = useCreateInventory({ mutation: { onSuccess: () => { invalidate(); setOpen(false); setForm(empty()); toast({ title: "Item added" }) }, onError: (e: any) => toast({ title: "Failed", description: e?.error || "Unknown", variant: "destructive" }) } })
  const updateMut = useUpdateInventory({ mutation: { onSuccess: () => { invalidate(); setOpen(false); setEditing(null); setForm(empty()); toast({ title: "Updated" }) }, onError: (e: any) => toast({ title: "Update failed", description: e?.error || "Unknown error", variant: "destructive" }) } })
  const deleteMut = useDeleteInventory({ mutation: { onSuccess: () => { invalidate(); toast({ title: "Removed" }) }, onError: (e: any) => toast({ title: "Delete failed", description: e?.error || "Unknown error", variant: "destructive" }) } })

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cement" /></div>
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
                <div><Label>Cost per Unit</Label><Input type="number" step="0.01" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} /></div>
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
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex justify-between items-start"><div><p className="text-xs uppercase font-semibold text-muted-foreground">Total Items</p><p className="text-2xl font-display font-bold mt-1">{totalSkus}</p></div><Boxes className="w-5 h-5 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between items-start"><div><p className="text-xs uppercase font-semibold text-muted-foreground">Inventory Value</p><p className="text-2xl font-display font-bold mt-1">{fmt(totalValue)}</p></div><Layers className="w-5 h-5 text-amber-500" /></div></CardContent></Card>
        <Card className={lowStock > 0 ? "border-destructive/50" : ""}><CardContent className="p-5"><div className="flex justify-between items-start"><div><p className="text-xs uppercase font-semibold text-muted-foreground">Low Stock Alerts</p><p className={`text-2xl font-display font-bold mt-1 ${lowStock > 0 ? "text-destructive" : ""}`}>{lowStock}</p></div><AlertTriangle className={`w-5 h-5 ${lowStock > 0 ? "text-destructive" : "text-muted-foreground"}`} /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between items-start"><div><p className="text-xs uppercase font-semibold text-muted-foreground">Top Material</p><p className="text-base font-bold mt-1 truncate">{topItem?.name ?? "—"}</p><p className="text-xs text-muted-foreground">{topItem ? fmt(topItem.totalValue) : "—"}</p></div><Package className="w-5 h-5 text-primary" /></div></CardContent></Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Materials</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
          ) : items?.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted mb-3" />
              <p className="font-semibold">No materials tracked yet</p>
              <p className="text-sm text-muted-foreground">Add your first material to start tracking inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Material</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Cost / Unit</th>
                    <th className="px-4 py-3 text-right">Total Value</th>
                    <th className="px-4 py-3 text-left">Vendor</th>
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items?.map(it => {
                    const project = projects?.find(p => p.id === it.projectId)
                    return (
                      <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{it.name}</span>
                            {it.isLow && <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="w-3 h-3" />Low</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{it.quantity.toLocaleString()} <span className="text-muted-foreground text-xs">{it.unit}</span></td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(it.costPerUnit)}</td>
                        <td className="px-4 py-3 text-right font-display font-bold">{fmt(it.totalValue)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.vendor ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{project?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(it)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete ${it.name}?`)) deleteMut.mutate({ id: it.id }) }}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
