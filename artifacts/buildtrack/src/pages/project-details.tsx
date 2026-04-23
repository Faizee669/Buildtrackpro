import { useRoute, Link } from "wouter"
import {
  useGetProject, useListExpenses, useUpdateProject, useDeleteProject,
  useListPhases, useCreatePhase, useUpdatePhase, useDeletePhase,
  getListProjectsQueryKey, getGetProjectQueryKey, getListPhasesQueryKey,
} from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Edit, Trash2, Calendar, Receipt, AlertTriangle, Loader2, Plus, Layers, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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

const STATUS_LABEL = { active: "Active", completed: "Completed", on_hold: "On Hold" }

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold"])
})

const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold"]),
})

export default function ProjectDetails() {
  const { fmt } = useCurrency()
  const [, params] = useRoute("/projects/:id")
  const projectId = parseInt(params?.id || "0", 10)

  const { data: project, isLoading: projLoading } = useGetProject(projectId)
  const { data: expenses, isLoading: expLoading } = useListExpenses({ projectId })
  const { data: phases, isLoading: phasesLoading } = useListPhases(projectId)

  const [editOpen, setEditOpen] = useState(false)
  const [addPhaseOpen, setAddPhaseOpen] = useState(false)
  const [editPhaseId, setEditPhaseId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) })
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() })
    queryClient.invalidateQueries({ queryKey: getListPhasesQueryKey(projectId) })
  }

  const updateProject = useUpdateProject({
    mutation: {
      onSuccess: () => { invalidate(); setEditOpen(false); toast({ title: "Project updated" }) }
    }
  })

  const deleteProject = useDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() })
        toast({ title: "Project deleted" })
        window.location.href = "/projects"
      }
    }
  })

  const createPhase = useCreatePhase(projectId, {
    mutation: {
      onSuccess: () => { invalidate(); setAddPhaseOpen(false); phaseForm.reset({ name: "", description: "", status: "active" }); toast({ title: "Phase added" }) },
      onError: (e: any) => toast({ title: "Failed to add phase", description: e?.error, variant: "destructive" })
    }
  })

  const updatePhase = useUpdatePhase({
    mutation: {
      onSuccess: () => { invalidate(); setEditPhaseId(null); toast({ title: "Phase updated" }) },
      onError: (e: any) => toast({ title: "Failed to update phase", description: e?.error, variant: "destructive" })
    }
  })

  const deletePhase = useDeletePhase({
    mutation: {
      onSuccess: () => { invalidate(); toast({ title: "Phase deleted" }) },
      onError: (e: any) => toast({ title: "Failed to delete phase", description: e?.error, variant: "destructive" })
    }
  })

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    values: project ? {
      name: project.name,
      description: project.description || "",
      budget: project.budget,
      startDate: project.startDate,
      status: project.status as any
    } : undefined
  })

  const phaseForm = useForm<z.infer<typeof phaseSchema>>({
    resolver: zodResolver(phaseSchema),
    defaultValues: { name: "", description: "", status: "active" }
  })

  const editPhaseForm = useForm<z.infer<typeof phaseSchema>>({
    resolver: zodResolver(phaseSchema),
    defaultValues: { name: "", description: "", status: "active" }
  })

  if (projLoading || expLoading || phasesLoading) return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Link>
      </div>
      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
    </div>
  )

  if (!project) return (
    <div className="space-y-6">
      <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> All Projects
      </Link>
      <p className="text-muted-foreground">Project not found.</p>
    </div>
  )

  const pct = project.budget > 0 ? (project.totalExpenses / project.budget) * 100 : 0
  const isOverBudget = project.totalExpenses > project.budget

  const catBreakdown = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(catBreakdown || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects" className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground text-sm font-medium transition-colors hover-elevate">
          <ArrowLeft className="w-4 h-4" /> All Projects
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
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(d => updateProject.mutate({ id: projectId, data: d }))} className="space-y-4">
                  <FormField control={projectForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={projectForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={projectForm.control} name="budget" render={({ field }) => (
                      <FormItem><FormLabel>Budget</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={projectForm.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={projectForm.control} name="status" render={({ field }) => (
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
                  <Button type="submit" className="w-full" disabled={updateProject.isPending}>Save Changes</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm("Delete this project? All expenses will be removed.")) deleteProject.mutate({ id: projectId })
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI row */}
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
                <p className="text-3xl font-display font-bold">{fmt(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Spent</p>
                <p className="text-3xl font-display font-bold">{fmt(project.totalExpenses)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Remaining</p>
                <p className={`text-3xl font-display font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>{fmt(project.remainingBudget)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Budget Utilization</span>
                <span className={isOverBudget ? 'text-destructive font-bold' : ''}>{pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 bg-secondary/20 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full transition-all duration-1000 ease-out rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
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
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || 'var(--color-chart-7)'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-sm">No expenses yet.</p>}
            <div className="w-full mt-4 space-y-2">
              {pieData.sort((a, b) => b.value - a.value).slice(0, 3).map(d => (
                <div key={d.name} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[d.name] }} />
                    <span>{d.name}</span>
                  </div>
                  <span className="font-medium">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Phases + Expenses */}
      <Tabs defaultValue="phases">
        <TabsList className="mb-4">
          <TabsTrigger value="phases" className="gap-2"><Layers className="w-4 h-4" /> Phases / Sub-Sites</TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2"><Receipt className="w-4 h-4" /> Expenses</TabsTrigger>
        </TabsList>

        {/* ── Phases tab ── */}
        <TabsContent value="phases">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{phases?.length ?? 0} phase{phases?.length !== 1 ? 's' : ''} defined</p>
            </div>
            <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 font-semibold">
                  <Plus className="w-4 h-4" /> Add Phase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle>Add Phase / Sub-Site</DialogTitle></DialogHeader>
                <Form {...phaseForm}>
                  <form onSubmit={phaseForm.handleSubmit(d => createPhase.mutate({ data: d }))} className="space-y-4 pt-1">
                    <FormField control={phaseForm.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Phase Name</FormLabel><FormControl><Input placeholder="e.g. Foundation, Framing, Electrical…" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={phaseForm.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Input placeholder="Short description" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={phaseForm.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full font-bold" disabled={createPhase.isPending}>
                      {createPhase.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding…</> : "Add Phase"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {phases?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map(phase => (
                <Card key={phase.id} className="shadow-sm border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold text-foreground">{phase.name}</p>
                        {phase.description && <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>}
                      </div>
                      <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-sm border flex-shrink-0 ${STATUS_COLORS[phase.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABEL[phase.status as keyof typeof STATUS_LABEL]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-bold text-sm">{fmt(phase.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expenses</p>
                        <p className="font-bold text-sm">{phase.expenseCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Dialog open={editPhaseId === phase.id} onOpenChange={open => {
                        if (open) {
                          setEditPhaseId(phase.id)
                          editPhaseForm.reset({ name: phase.name, description: phase.description || "", status: phase.status as any })
                        } else {
                          setEditPhaseId(null)
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader><DialogTitle>Edit Phase</DialogTitle></DialogHeader>
                          <Form {...editPhaseForm}>
                            <form onSubmit={editPhaseForm.handleSubmit(d => updatePhase.mutate({ id: phase.id, data: d }))} className="space-y-4 pt-1">
                              <FormField control={editPhaseForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Phase Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={editPhaseForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={editPhaseForm.control} name="status" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="on_hold">On Hold</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <Button type="submit" className="w-full" disabled={updatePhase.isPending}>Save</Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Delete phase "${phase.name}"? Expenses assigned to it won't be deleted.`))
                            deletePhase.mutate({ id: phase.id })
                        }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No phases defined yet</p>
              <p className="text-sm mt-1">Break this project into phases like Foundation, Framing, Electrical…</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setAddPhaseOpen(true)}>
                <Plus className="w-4 h-4" /> Add First Phase
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Expenses tab ── */}
        <TabsContent value="expenses">
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
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                          <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                          {(expense as any).phaseName && <><span>•</span><span className="font-medium text-foreground/70">{(expense as any).phaseName}</span></>}
                          {(expense as any).crew && <><span>•</span><span>Crew: {(expense as any).crew}</span></>}
                          {(expense as any).equipment && <><span>•</span><span>Equip: {(expense as any).equipment}</span></>}
                          {expense.notes && <><span>•</span><span>{expense.notes}</span></>}
                        </div>
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
                <Link href="/add-expense" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                  + Add your first expense
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
