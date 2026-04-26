import { useState, useMemo } from "react";
import { useListExpenses, useListProjects, useListCrew, useListInventory } from "@workspace/api-client-react";
import { useCurrency } from "@/lib/currency-context";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Search, X, Loader2, ChevronUp, ChevronDown, TableProperties } from "lucide-react";

type SortDir = "asc" | "desc";

function useSortable<T>(data: T[], defaultKey: keyof T) {
  const [key, setKey] = useState<keyof T>(defaultKey);
  const [dir, setDir] = useState<SortDir>("asc");

  const toggle = (k: keyof T) => {
    if (k === key) setDir(d => d === "asc" ? "desc" : "asc");
    else { setKey(k); setDir("asc"); }
  };

  const sorted = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
  }, [data, key, dir]);

  const Th = ({ colKey, children }: { colKey: keyof T; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap hover:bg-muted/50 transition-colors"
      onClick={() => toggle(colKey)}
    >
      <span className="flex items-center gap-1">
        {children}
        {key === colKey ? (
          dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3 opacity-20" />
        )}
      </span>
    </TableHead>
  );

  return { sorted, Th };
}

function fmtDate(v: unknown) {
  if (!v) return "—";
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(v); }
}

function csvDownload(filename: string, headers: string[], rows: unknown[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const content = [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const TABS = ["Expenses", "Crew", "Inventory", "Projects"] as const;
type Tab = typeof TABS[number];

export default function MasterLedger() {
  const { fmt } = useCurrency();
  const [tab, setTab] = useState<Tab>("Expenses");
  const [search, setSearch] = useState("");

  const { data: expenses, isLoading: expL } = useListExpenses({});
  const { data: projects, isLoading: projL } = useListProjects();
  const { data: crew, isLoading: crewL } = useListCrew({});
  const { data: inventory, isLoading: invL } = useListInventory({});

  const isLoading = expL || projL || crewL || invL;
  const q = search.toLowerCase().trim();

  // ── Expenses ──────────────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() =>
    (expenses ?? []).filter(e =>
      !q || [e.category, e.vendor, e.crew, e.notes, e.projectName, e.phaseName]
        .some(v => (v ?? "").toLowerCase().includes(q))
    ), [expenses, q]);

  const expSort = useSortable(filteredExpenses, "date" as any);

  const downloadExpenses = () => csvDownload("expenses.csv",
    ["Date", "Project", "Phase", "Category", "Amount (PKR)", "Vendor", "Crew", "Equipment", "Notes"],
    (expenses ?? []).map(e => [e.date, e.projectName ?? "", e.phaseName ?? "", e.category, e.amount, e.vendor ?? "", e.crew ?? "", e.equipment ?? "", e.notes ?? ""])
  );

  // ── Crew ──────────────────────────────────────────────────────────────────
  const filteredCrew = useMemo(() =>
    (crew ?? []).filter(c =>
      !q || [c.name, c.role, c.phone, c.status].some(v => (v ?? "").toLowerCase().includes(q))
    ), [crew, q]);

  const crewSort = useSortable(filteredCrew, "name" as any);

  const downloadCrew = () => csvDownload("crew.csv",
    ["Name", "Role", "Rate (PKR)", "Rate Type", "Phone", "Status", "Date Added"],
    (crew ?? []).map(c => [c.name, c.role, c.rate, c.rateType, c.phone ?? "", c.status, fmtDate(c.createdAt)])
  );

  // ── Inventory ─────────────────────────────────────────────────────────────
  const filteredInventory = useMemo(() =>
    (inventory ?? []).filter(i =>
      !q || [i.name, i.unit, i.vendor].some(v => (v ?? "").toLowerCase().includes(q))
    ), [inventory, q]);

  const invSort = useSortable(filteredInventory, "name" as any);

  const downloadInventory = () => csvDownload("inventory.csv",
    ["Name", "Qty", "Unit", "Cost/Unit (PKR)", "Total Value (PKR)", "Reorder Level", "Vendor"],
    (inventory ?? []).map(i => [i.name, i.quantity, i.unit, i.costPerUnit, (Number(i.quantity) * Number(i.costPerUnit)).toFixed(2), i.reorderLevel, i.vendor ?? ""])
  );

  // ── Projects ──────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() =>
    (projects ?? []).filter(p =>
      !q || [p.name, p.location, p.status].some(v => (v ?? "").toLowerCase().includes(q))
    ), [projects, q]);

  const projSort = useSortable(filteredProjects, "name" as any);

  const downloadProjects = () => csvDownload("projects.csv",
    ["Name", "Status", "Budget (PKR)", "Spent (PKR)", "Remaining (PKR)", "Revenue (PKR)", "Start Date"],
    (projects ?? []).map(p => [p.name, p.status, p.budget, p.totalExpenses, p.remainingBudget, p.estimatedRevenue, fmtDate(p.startDate)])
  );

  const downloadAll = () => {
    downloadExpenses(); downloadCrew(); downloadInventory(); downloadProjects();
  };

  const tabCounts: Record<Tab, number> = {
    Expenses: (expenses ?? []).length,
    Crew: (crew ?? []).length,
    Inventory: (inventory ?? []).length,
    Projects: (projects ?? []).length,
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TableProperties className="w-6 h-6 text-primary" />
            Master Ledger
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            All records from every module in one place — sortable, searchable, exportable.
          </p>
        </div>
        <Button variant="outline" onClick={downloadAll} className="gap-2 self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export All (CSV)
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search across all records..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {tabCounts[t]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── EXPENSES ── */}
          {tab === "Expenses" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{filteredExpenses.length} records</span>
                <Button size="sm" variant="ghost" onClick={downloadExpenses} className="gap-1.5 text-xs h-8">
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <div className="border border-border rounded-xl overflow-auto max-h-[65vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                    <TableRow>
                      <expSort.Th colKey={"date" as any}>Date</expSort.Th>
                      <expSort.Th colKey={"projectName" as any}>Project</expSort.Th>
                      <expSort.Th colKey={"phaseName" as any}>Phase</expSort.Th>
                      <expSort.Th colKey={"category" as any}>Category</expSort.Th>
                      <expSort.Th colKey={"amount" as any}>Amount (PKR)</expSort.Th>
                      <expSort.Th colKey={"vendor" as any}>Vendor</expSort.Th>
                      <expSort.Th colKey={"crew" as any}>Crew</expSort.Th>
                      <expSort.Th colKey={"equipment" as any}>Equipment</expSort.Th>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expSort.sorted.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">No expenses found</TableCell></TableRow>
                    ) : expSort.sorted.map(e => (
                      <TableRow key={e.id} className="hover:bg-muted/30 transition-colors text-sm">
                        <TableCell className="whitespace-nowrap font-mono text-xs">{fmtDate(e.date)}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{e.projectName ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{e.phaseName ?? "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.category}</Badge></TableCell>
                        <TableCell className="font-semibold text-right">{fmt(Number(e.amount))}</TableCell>
                        <TableCell>{e.vendor ?? "—"}</TableCell>
                        <TableCell>{e.crew ?? "—"}</TableCell>
                        <TableCell>{e.equipment ?? "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{e.notes ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredExpenses.length > 0 && (
                <div className="text-sm font-semibold text-right text-foreground pr-1">
                  Total: {fmt(filteredExpenses.reduce((s, e) => s + Number(e.amount), 0))}
                </div>
              )}
            </div>
          )}

          {/* ── CREW ── */}
          {tab === "Crew" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{filteredCrew.length} records</span>
                <Button size="sm" variant="ghost" onClick={downloadCrew} className="gap-1.5 text-xs h-8">
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <div className="border border-border rounded-xl overflow-auto max-h-[65vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                    <TableRow>
                      <crewSort.Th colKey={"name" as any}>Name</crewSort.Th>
                      <crewSort.Th colKey={"role" as any}>Role</crewSort.Th>
                      <crewSort.Th colKey={"rate" as any}>Rate (PKR)</crewSort.Th>
                      <crewSort.Th colKey={"rateType" as any}>Rate Type</crewSort.Th>
                      <crewSort.Th colKey={"phone" as any}>Phone</crewSort.Th>
                      <crewSort.Th colKey={"status" as any}>Status</crewSort.Th>
                      <crewSort.Th colKey={"laborCost" as any}>Labor Cost (PKR)</crewSort.Th>
                      <crewSort.Th colKey={"createdAt" as any}>Date Added</crewSort.Th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewSort.sorted.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">No crew members found</TableCell></TableRow>
                    ) : crewSort.sorted.map(c => (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors text-sm">
                        <TableCell className="font-semibold">{c.name}</TableCell>
                        <TableCell>{c.role}</TableCell>
                        <TableCell className="text-right">{fmt(Number(c.rate))}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">{c.rateType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{c.phone ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{fmt(Number((c as any).laborCost ?? 0))}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{fmtDate(c.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {tab === "Inventory" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{filteredInventory.length} records</span>
                <Button size="sm" variant="ghost" onClick={downloadInventory} className="gap-1.5 text-xs h-8">
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <div className="border border-border rounded-xl overflow-auto max-h-[65vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                    <TableRow>
                      <invSort.Th colKey={"name" as any}>Item Name</invSort.Th>
                      <invSort.Th colKey={"quantity" as any}>Qty</invSort.Th>
                      <invSort.Th colKey={"unit" as any}>Unit</invSort.Th>
                      <invSort.Th colKey={"costPerUnit" as any}>Cost/Unit (PKR)</invSort.Th>
                      <invSort.Th colKey={"totalValue" as any}>Total Value (PKR)</invSort.Th>
                      <invSort.Th colKey={"reorderLevel" as any}>Reorder Level</invSort.Th>
                      <invSort.Th colKey={"vendor" as any}>Vendor</invSort.Th>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invSort.sorted.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">No inventory items found</TableCell></TableRow>
                    ) : invSort.sorted.map(i => (
                      <TableRow key={i.id} className="hover:bg-muted/30 transition-colors text-sm">
                        <TableCell className="font-semibold">{i.name}</TableCell>
                        <TableCell className="text-right">{Number(i.quantity).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{i.unit}</TableCell>
                        <TableCell className="text-right">{fmt(Number(i.costPerUnit))}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt(Number(i.quantity) * Number(i.costPerUnit))}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{Number(i.reorderLevel).toLocaleString()}</TableCell>
                        <TableCell>{i.vendor ?? "—"}</TableCell>
                        <TableCell>
                          {(i as any).isLow ? (
                            <Badge className="bg-rose-100 text-rose-700 text-xs">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredInventory.length > 0 && (
                <div className="text-sm font-semibold text-right text-foreground pr-1">
                  Total Value: {fmt(filteredInventory.reduce((s, i) => s + Number(i.quantity) * Number(i.costPerUnit), 0))}
                </div>
              )}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === "Projects" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{filteredProjects.length} records</span>
                <Button size="sm" variant="ghost" onClick={downloadProjects} className="gap-1.5 text-xs h-8">
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <div className="border border-border rounded-xl overflow-auto max-h-[65vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                    <TableRow>
                      <projSort.Th colKey={"name" as any}>Project</projSort.Th>
                      <projSort.Th colKey={"status" as any}>Status</projSort.Th>
                      <projSort.Th colKey={"budget" as any}>Budget (PKR)</projSort.Th>
                      <projSort.Th colKey={"totalExpenses" as any}>Spent (PKR)</projSort.Th>
                      <projSort.Th colKey={"remainingBudget" as any}>Remaining (PKR)</projSort.Th>
                      <projSort.Th colKey={"laborSpent" as any}>Labor Spent (PKR)</projSort.Th>
                      <projSort.Th colKey={"estimatedRevenue" as any}>Revenue (PKR)</projSort.Th>
                      <projSort.Th colKey={"profitMargin" as any}>Margin %</projSort.Th>
                      <projSort.Th colKey={"startDate" as any}>Start Date</projSort.Th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projSort.sorted.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">No projects found</TableCell></TableRow>
                    ) : projSort.sorted.map(p => {
                      const over = Number(p.totalExpenses) > Number(p.budget);
                      return (
                        <TableRow key={p.id} className="hover:bg-muted/30 transition-colors text-sm">
                          <TableCell className="font-semibold">{p.name}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs capitalize ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : p.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                              {p.status?.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{fmt(Number(p.budget))}</TableCell>
                          <TableCell className={`text-right font-semibold ${over ? "text-rose-600" : ""}`}>{fmt(Number(p.totalExpenses))}</TableCell>
                          <TableCell className={`text-right ${Number(p.remainingBudget) < 0 ? "text-rose-600 font-semibold" : "text-emerald-600"}`}>{fmt(Number(p.remainingBudget))}</TableCell>
                          <TableCell className="text-right">{fmt(Number(p.laborSpent))}</TableCell>
                          <TableCell className="text-right">{fmt(Number(p.estimatedRevenue))}</TableCell>
                          <TableCell className="text-right">
                            <span className={Number(p.profitMargin) < 0 ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>
                              {Number(p.profitMargin).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">{fmtDate(p.startDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
