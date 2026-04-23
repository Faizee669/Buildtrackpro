import { useMemo, useState } from "react"
import { useListInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useListProjects, getListInventoryQueryKey, type InventoryItem } from "@workspace/api-client-react"
import { useCurrency } from "@/lib/currency-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
      {(() => {
        const stat = (label: string, value: string, sub: string | null, icon: React.ReactNode, iconBg: string, iconColor: string, valueColor = "") => (
          <div className="bg-card p-5 rounded-2xl border border-card-border shadow-sm flex flex-col gap-3">
            <div className={`p-2 rounded-lg ${iconBg} ${iconColor} self-start`}>{icon}</div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-1 truncate ${valueColor}`}>{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          </div>
        )
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stat("Total Items", String(totalSkus), null, <Boxes className="w-5 h-5" />, "bg-orange-50", "text-primary")}
            {stat("Inventory Value", fmt(totalValue), null, <Layers className="w-5 h-5" />, "bg-amber-50", "text-amber-600")}
            {stat("Low Stock", String(lowStock), lowStock > 0 ? "Reorder needed" : "All stocked", <AlertTriangle className="w-5 h-5" />, lowStock > 0 ? "bg-red-50" : "bg-emerald-50", lowStock > 0 ? "text-destructive" : "text-emerald-600", lowStock > 0 ? "text-destructive" : "")}
            {stat("Top Material", topItem?.name ?? "—", topItem ? fmt(topItem.totalValue) : "—", <Package className="w-5 h-5" />, "bg-purple-50", "text-purple-600")}
          </div>
        )
      })()}

      {/* Materials list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Materials</h2>
          <span className="text-xs text-muted-foreground">{items?.length ?? 0} items tracked</span>
        </div>
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : items?.length === 0 ? (
          <div className="bg-card rounded-2xl border border-card-border p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-semibold">No materials tracked yet</p>
            <p className="text-sm text-muted-foreground">Add your first material to start tracking inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items?.map(it => {
              const project = projects?.find(p => p.id === it.projectId)
              return (
                <div key={it.id} className="bg-card rounded-2xl p-4 border border-card-border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${it.isLow ? "bg-red-50 text-destructive" : "bg-orange-50 text-primary"}`}>
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">{it.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {it.quantity.toLocaleString()} {it.unit}
                          {it.reorderLevel > 0 && <span className="text-xs"> / reorder at {it.reorderLevel}</span>}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {it.vendor && <span>{it.vendor}</span>}
                          {project && <span>{it.vendor ? " · " : ""}{project.name}</span>}
                        </div>
                      </div>
                    </div>
                    {it.isLow ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap bg-red-50 text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap bg-emerald-50 text-emerald-700">
                        In Stock
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-card-border">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Unit Price</p>
                      <p className="text-sm font-bold text-foreground">{fmt(it.costPerUnit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Value</p>
                      <p className="text-sm font-bold text-primary">{fmt(it.totalValue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-card-border -mx-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(it)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete ${it.name}?`)) deleteMut.mutate({ id: it.id }) }} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
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
