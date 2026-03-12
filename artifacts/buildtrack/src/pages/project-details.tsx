import { useRoute, Link } from "wouter"
import { useGetProject, useListExpenses, useUpdateProject, useDeleteProject } from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Edit, Trash2, Calendar, Receipt, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getListProjectsQueryKey, getGetProjectQueryKey } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold"])
});

export default function ProjectDetails() {
  const { fmt } = useCurrency();
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0", 10);
  
  const { data: project, isLoading: projLoading } = useGetProject(projectId);
  const { data: expenses, isLoading: expLoading } = useListExpenses({ projectId });
  
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setEditOpen(false);
        toast({ title: "Project updated" });
      }
    }
  });

  const deleteMutation = useDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({ title: "Project deleted" });
        window.location.href = "/projects";
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: project ? {
      name: project.name,
      description: project.description || "",
      budget: project.budget,
      startDate: project.startDate,
      status: project.status as any
    } : undefined
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateMutation.mutate({ id: projectId, data });
  };

  if (projLoading || expLoading) return <div className="flex p-20 justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!project) return <div>Project not found</div>;

  const pct = project.budget > 0 ? (project.totalExpenses / project.budget) * 100 : 0;
  const isOverBudget = project.totalExpenses > project.budget;

  // Compute category breakdown for this project
  const catBreakdown = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.entries(catBreakdown || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/projects" className="p-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground transition-colors hover-elevate">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-sm border ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{project.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hover-elevate">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem><FormLabel>Budget</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="status" render={({ field }) => (
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
                  <Button type="submit" className="w-full" disabled={updateMutation.isPending}>Save Changes</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm("Are you sure you want to delete this project? All associated expenses will be lost.")) {
              deleteMutation.mutate({ id: projectId });
            }
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border border-border">
          <CardHeader className="bg-secondary/10 border-b border-border pb-4">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Financial Overview</span>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Total Budget</p>
                <p className="text-3xl font-display font-bold text-foreground">{fmt(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Spent</p>
                <p className="text-3xl font-display font-bold text-foreground">{fmt(project.totalExpenses)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Remaining</p>
                <p className={`text-3xl font-display font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  {fmt(project.remainingBudget)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Budget Utilization</span>
                <span className={isOverBudget ? 'text-destructive font-bold' : ''}>{pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 bg-secondary/20 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <p className="text-destructive text-sm flex items-center gap-1 mt-2 font-medium">
                  <AlertTriangle className="w-4 h-4" /> This project has exceeded its budget.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border">
          <CardHeader className="border-b border-border pb-4">
             <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[250px]">
            {pieData.length > 0 ? (
               <div className="w-full h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || 'var(--color-chart-7)'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => fmt(value)}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
            ) : (
              <p className="text-muted-foreground text-sm">No expenses yet.</p>
            )}
            
            <div className="w-full mt-4 space-y-2">
              {pieData.sort((a,b)=>b.value-a.value).slice(0, 3).map(d => (
                 <div key={d.name} className="flex justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: CATEGORY_COLORS[d.name]}}></div>
                     <span>{d.name}</span>
                   </div>
                   <span className="font-medium">{fmt(d.value)}</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Project Expenses</h3>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {expenses?.length ? (
          <div className="divide-y divide-border">
            {expenses.map(expense => (
              <div key={expense.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-secondary/10 text-secondary-foreground border border-secondary/20">
                     <Receipt className="w-5 h-5" style={{ color: CATEGORY_COLORS[expense.category] }} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{expense.vendor || 'Unnamed Vendor'}</p>
                    <p className="text-sm text-muted-foreground">{format(parseISO(expense.date), 'MMM d, yyyy')} • {expense.notes || 'No notes'}</p>
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
            <p>No expenses recorded for this project.</p>
            <Link href="/add-expense">
              <Button variant="link" className="text-primary mt-2">Add your first expense</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
