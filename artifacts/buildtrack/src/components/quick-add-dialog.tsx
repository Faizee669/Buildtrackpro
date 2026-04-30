import { useState } from "react"
import { useCreateExpense, useCreateProject, useListProjects, useListPhases } from "@workspace/api-client-react"
import { getListExpensesQueryKey, getGetDashboardStatsQueryKey, getListProjectsQueryKey, getListPhasesQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlusCircle, Receipt, FolderPlus, Loader2 } from "lucide-react"

const CATEGORIES = ["Possession", "Foundation", "Cement", "Aggregates", "Bricks", "Steel", "Labour", "Paint", "Electric", "Wood", "Door Frame", "Plumbing", "Watchman Salary"] as const

const expenseSchema = z.object({
  projectId: z.coerce.number().min(1, "Please select a project"),
  phaseId: z.coerce.number().optional().nullable(),
  category: z.enum(CATEGORIES),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  vendor: z.string().optional(),
  crew: z.string().optional(),
  equipment: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  budget: z.coerce.number().min(1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold"]),
})

function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: projects } = useListProjects()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      category: "Possession",
      amount: 0,
      vendor: "",
      crew: "",
      equipment: "",
      notes: "",
      phaseId: null,
    },
  })

  const selectedProjectId = form.watch("projectId")
  const { data: phases } = useListPhases(Number(selectedProjectId) || 0, {
    query: { 
      enabled: !!selectedProjectId && Number(selectedProjectId) > 0,
      queryKey: getListPhasesQueryKey(Number(selectedProjectId) || 0)
    }
  })

  const mutation = useCreateExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() })
        toast({ title: "Expense added!", description: "Your expense has been recorded." })
        form.reset({ date: new Date().toISOString().split("T")[0], category: "Possession", amount: 0, vendor: "", crew: "", equipment: "", notes: "", phaseId: null })
        onSuccess()
      },
      onError: (err: any) => {
        toast({ title: "Failed to add expense", description: err?.data?.error || err?.message || "Unknown error", variant: "destructive" })
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => mutation.mutate({ data: d }))} className="space-y-4 pt-2">
        <FormField control={form.control} name="projectId" render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <Select onValueChange={v => { field.onChange(v); form.setValue("phaseId", null) }} value={field.value?.toString()}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select project…" /></SelectTrigger></FormControl>
              <SelectContent>
                {projects?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phaseId" render={({ field }) => (
          <FormItem>
            <FormLabel>Phase <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <Select
              onValueChange={v => field.onChange(v === "none" ? null : Number(v))}
              value={field.value ? String(field.value) : "none"}
              disabled={!selectedProjectId || Number(selectedProjectId) <= 0}
            >
              <FormControl><SelectTrigger><SelectValue placeholder={!selectedProjectId ? "Select project first" : "No phase"} /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="none">— No phase —</SelectItem>
                {phases?.map(ph => <SelectItem key={ph.id} value={String(ph.id)}>{ph.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="vendor" render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl><Input placeholder="Vendor name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="crew" render={({ field }) => (
            <FormItem>
              <FormLabel>Crew <span className="text-muted-foreground font-normal">(opt)</span></FormLabel>
              <FormControl><Input placeholder="Crew / team" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="equipment" render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment <span className="text-muted-foreground font-normal">(opt)</span></FormLabel>
              <FormControl><Input placeholder="e.g. Excavator" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <FormControl><Input placeholder="e.g. Invoice #123" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full font-bold" disabled={mutation.isPending}>
          {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save Expense"}
        </Button>
      </form>
    </Form>
  )
}

function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      budget: 0,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
    },
  })

  const mutation = useCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() })
        toast({ title: "Project created!", description: "Your new project is ready." })
        form.reset({ name: "", description: "", location: "", budget: 0, startDate: new Date().toISOString().split("T")[0], status: "active" })
        onSuccess()
      },
      onError: (err: any) => {
        toast({ title: "Failed to create project", description: err?.data?.error || err?.message || "Unknown error", variant: "destructive" })
      },
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => mutation.mutate({ data: d }))} className="space-y-4 pt-2">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl><Input placeholder="e.g. Office Block A" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel>Location <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <FormControl><Input placeholder="e.g. Gulberg, Lahore" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="budget" render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
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

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <FormControl><Input placeholder="Short description" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full font-bold" disabled={mutation.isPending}>
          {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : "Create Project"}
        </Button>
      </form>
    </Form>
  )
}

interface QuickAddDialogProps {
  defaultTab?: "expense" | "project"
  children?: React.ReactNode
}

export function QuickAddDialog({ defaultTab = "expense", children }: QuickAddDialogProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<string>(defaultTab)

  const handleSuccess = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setTab(defaultTab) }}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/20 hover-elevate active-elevate-2">
            <PlusCircle className="w-5 h-5" />
            Quick Add
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Quick Add</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="expense" className="gap-2">
              <Receipt className="w-4 h-4" /> Expense
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-2">
              <FolderPlus className="w-4 h-4" /> Project
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
            <ExpenseForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="project">
            <ProjectForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
