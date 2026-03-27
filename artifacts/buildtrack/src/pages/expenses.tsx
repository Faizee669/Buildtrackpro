import { useState, useMemo } from "react"
import { useListExpenses, useListProjects, useDeleteExpense, getExportExpensesUrl } from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { format, parseISO } from "date-fns"
import { Download, Filter, Receipt, Trash2, Loader2, Image as ImageIcon, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQueryClient } from "@tanstack/react-query"
import { getListExpensesQueryKey } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { Link } from "wouter"

const CATEGORIES = ["Materials", "Labor", "Fuel", "Equipment Rental", "Tools", "Permits", "Misc"]

export default function Expenses() {
  const { fmt } = useCurrency();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [vendorSearch, setVendorSearch] = useState<string>("");

  const params = {
    ...(projectId ? { projectId } : {}),
    ...(category && category !== 'all' ? { category } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {})
  };

  const { data: expenses, isLoading } = useListExpenses(params);
  const { data: projects } = useListProjects();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (!vendorSearch.trim()) return expenses;
    const search = vendorSearch.toLowerCase().trim();
    return expenses.filter(e => 
      (e.vendor ?? '').toLowerCase().includes(search) ||
      (e.notes ?? '').toLowerCase().includes(search)
    );
  }, [expenses, vendorSearch]);

  const deleteMutation = useDeleteExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        toast({ title: "Expense deleted" });
      }
    }
  });

  const handleExport = () => {
    window.open(getExportExpensesUrl(params), '_blank');
  };

  const hasFilters = projectId || category || startDate || endDate || vendorSearch;
  const clearAll = () => {
    setProjectId(null);
    setCategory(null);
    setStartDate("");
    setEndDate("");
    setVendorSearch("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Ledger</h2>
          <p className="text-muted-foreground">View, filter, and export all transactions</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="hover-elevate shadow-sm w-full md:w-auto" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button asChild className="hover-elevate active-elevate-2 shadow-sm w-full md:w-auto">
            <Link href="/add-expense">Add Expense</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
          <Filter className="w-4 h-4" /> Filters
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto text-xs text-muted-foreground hover:text-foreground h-7 gap-1">
              <X className="w-3 h-3" /> Clear all
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end flex-wrap">
          <div className="w-full md:w-48">
            <Select value={projectId?.toString() || "all"} onValueChange={(v) => setProjectId(v === "all" ? null : parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input 
              placeholder="Search vendor..." 
              value={vendorSearch}
              onChange={e => setVendorSearch(e.target.value)}
              className="pl-9"
            />
            {vendorSearch && (
              <button onClick={() => setVendorSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full md:w-36" title="Start Date" />
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full md:w-36" title="End Date" />
          </div>
        </div>
        {filteredExpenses.length !== expenses?.length && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses?.length ?? 0} expenses
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/5">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className="w-8 h-8 mb-2 opacity-20" />
                    <span>No expenses found matching these filters.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(parseISO(expense.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{expense.vendor || 'N/A'}</div>
                    {expense.notes && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{expense.notes}</div>}
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${expense.projectId}`} className="hover:underline text-primary">
                      {expense.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border" 
                          style={{
                            backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[expense.category]} 10%, transparent)`,
                            color: CATEGORY_COLORS[expense.category],
                            borderColor: `color-mix(in srgb, ${CATEGORY_COLORS[expense.category]} 20%, transparent)`
                          }}>
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-display font-bold">
                    {fmt(expense.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {expense.receiptUrl ? (
                      <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="inline-block p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Receipt">
                        <ImageIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/30">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => {
                        if (confirm("Delete this expense?")) {
                          deleteMutation.mutate({ id: expense.id });
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
