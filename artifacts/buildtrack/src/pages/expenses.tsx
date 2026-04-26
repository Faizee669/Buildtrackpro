import { useState, useMemo } from "react"
import { useListExpenses, useListProjects, useDeleteExpense, getExportExpensesUrl } from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { Download, Filter, Receipt, Trash2, Loader2, Image as ImageIcon, Search, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Link } from "wouter"

const CATEGORIES = ["Possession", "Foundation", "Cement", "Aggregates", "Bricks", "Steel", "Labour", "Paint", "Electric", "Wood", "Door Frame", "Plumbing", "Watchman Salary"]

// Safe date formatter – handles string, Date object, or null without crashing
function fmtDate(val: unknown): string {
  if (!val) return "—";
  try {
    const d = typeof val === "string" ? new Date(val) : val instanceof Date ? val : new Date(String(val));
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(val);
  }
}

export default function Expenses() {
  const { fmt } = useCurrency();
  const [projectFilter, setProjectFilter] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const queryParams = {
    ...(projectFilter ? { projectId: projectFilter } : {}),
    ...(category && category !== 'all' ? { category } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data: expenses, isLoading, isError, error } = useListExpenses(queryParams);
  const { data: projects } = useListProjects();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dynamicCategories = useMemo(() => {
    const defaultCats = CATEGORIES;
    if (!expenses) return defaultCats;
    const allCats = expenses.map(e => e.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...allCats])).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (!search.trim()) return expenses;
    const q = search.toLowerCase().trim();
    return expenses.filter(e =>
      (e.vendor ?? '').toLowerCase().includes(q) ||
      (e.notes ?? '').toLowerCase().includes(q) ||
      (e.category ?? '').toLowerCase().includes(q) ||
      (e.phaseName ?? '').toLowerCase().includes(q) ||
      (e.crew ?? '').toLowerCase().includes(q)
    );
  }, [expenses, search]);

  const deleteMutation = useDeleteExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
        toast({ title: "Expense deleted" });
      },
      onError: (e: any) => toast({ title: "Delete failed", description: e?.data?.error || e?.message || "Unknown error", variant: "destructive" })
    }
  });

  const handleExport = () => window.open(getExportExpensesUrl(queryParams), '_blank');

  const hasFilters = projectFilter || category || startDate || endDate || search;
  const clearAll = () => { setProjectFilter(null); setCategory(null); setStartDate(""); setEndDate(""); setSearch(""); };

  const totalShown = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Ledger</h2>
          <p className="text-muted-foreground">View, filter, search and export all transactions</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="shadow-sm w-full md:w-auto" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button asChild className="shadow-sm w-full md:w-auto">
            <Link href="/add-expense">Add Expense</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
          <Filter className="w-4 h-4" /> Filters
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto text-xs h-7 gap-1">
              <X className="w-3 h-3" /> Clear all
            </Button>
          )}
        </div>

        {/* Text search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search vendor, notes, category, phase, crew..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns + dates */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-full sm:w-48">
            <Select value={projectFilter?.toString() || "all"} onValueChange={v => setProjectFilter(v === "all" ? null : parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select value={category || "all"} onValueChange={v => setCategory(v === "all" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {dynamicCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-36" title="From Date" />
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-36" title="To Date" />
        </div>

        {/* Summary */}
        {!isLoading && !isError && expenses && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <span>
              {filteredExpenses.length !== expenses.length
                ? `Showing ${filteredExpenses.length} of ${expenses.length} expenses`
                : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
            </span>
            {filteredExpenses.length > 0 && (
              <span className="font-semibold text-foreground">Total: {fmt(totalShown)}</span>
            )}
          </div>
        )}
      </div>

      {/* Error banner */}
      {isError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Failed to load expenses</p>
            <p className="text-xs opacity-80">{(error as any)?.message ?? "Check that the server is running."}</p>
          </div>
        </div>
      )}

      {/* Main table — single unified view, no responsive toggling */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
              <TableHead className="font-semibold">Vendor / Details</TableHead>
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Phase</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold text-right whitespace-nowrap">Amount</TableHead>
              <TableHead className="font-semibold text-center">Receipt</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="h-20 text-center text-muted-foreground text-sm">
                  Could not load data. See error above.
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="w-8 h-8 opacity-20" />
                    <span className="text-sm">
                      {expenses?.length === 0
                        ? "No expenses yet. Click 'Add Expense' to start."
                        : "No expenses match your search or filters."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => {
                const catColor = CATEGORY_COLORS[expense.category] ?? "#888";
                return (
                  <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium whitespace-nowrap text-sm">
                      {fmtDate(expense.date)}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="font-semibold text-foreground truncate">
                        {expense.vendor || <span className="text-muted-foreground/50 font-normal italic">No vendor</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 mt-0.5">
                        {expense.crew && <span>👷 {expense.crew}</span>}
                        {expense.equipment && <span>🔧 {expense.equipment}</span>}
                        {expense.notes && <span className="truncate max-w-[180px]">{expense.notes}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/projects/${expense.projectId}`} className="hover:underline text-primary">
                        {expense.projectName ?? `#${expense.projectId}`}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.phaseName ?? <span className="text-muted-foreground/30">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${catColor} 12%, transparent)`,
                          color: catColor,
                          borderColor: `color-mix(in srgb, ${catColor} 25%, transparent)`
                        }}>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold whitespace-nowrap">
                      {fmt(Number(expense.amount) || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {expense.receiptUrl ? (
                        <a href={expense.receiptUrl} target="_blank" rel="noreferrer"
                          className="inline-block p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Receipt">
                          <ImageIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate({ id: expense.id }) }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
