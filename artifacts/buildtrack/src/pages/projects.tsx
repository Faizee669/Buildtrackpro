import { useState } from "react"
import { useListProjects, useCreateProject } from "@workspace/api-client-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { HardHat, Plus, MoreVertical, Calendar, TrendingUp } from "lucide-react"
import { Link } from "wouter"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { getListProjectsQueryKey } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold"])
});

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Project created successfully" });
      },
      onError: (error: any) => {
        toast({ title: "Failed to create project", description: error?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      budget: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: "active"
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage job sites and their budgets</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold hover-elevate active-elevate-2 shadow-sm gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input placeholder="e.g. 123 Main St Renovation" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Input placeholder="Brief details about the job" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
          <HardHat className="w-16 h-16 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create your first job site to start tracking expenses.</p>
          <Button onClick={() => setOpen(true)} variant="outline">Add Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects?.map(project => {
            const pct = project.budget > 0 ? Math.min((project.totalExpenses / project.budget) * 100, 100) : 0;
            const isOverBudget = project.totalExpenses > project.budget;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card h-full flex flex-col">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1 pr-4">
                      <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(project.startDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm border ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Budget</p>
                        <p className="font-display font-bold text-foreground">{formatCurrency(project.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Spent</p>
                        <p className={`font-display font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                          {formatCurrency(project.totalExpenses)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={isOverBudget ? 'text-destructive' : 'text-foreground'}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-secondary/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
