import { useState } from "react"
import { useLocation } from "wouter"
import { useCreateExpense, useListProjects, useUploadReceipt } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { getListExpensesQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { UploadCloud, Receipt, Loader2, ArrowLeft } from "lucide-react"
import { Link } from "wouter"

const CATEGORIES = ["Materials", "Labor", "Fuel", "Equipment Rental", "Tools", "Permits", "Misc"] as const;

const formSchema = z.object({
  projectId: z.coerce.number().min(1, "Project is required"),
  category: z.enum(CATEGORIES),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  vendor: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export default function ExpenseFormPage() {
  const [, setLocation] = useLocation();
  const { data: projects, isLoading: projLoading } = useListProjects();
  const [uploading, setUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Expense logged successfully" });
        setLocation("/expenses");
      },
      onError: (err: any) => {
        toast({ title: "Failed to log expense", description: err?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const uploadMutation = useUploadReceipt();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "Materials",
      vendor: "",
      notes: "",
      receiptUrl: ""
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadMutation.mutateAsync({ data: { file } });
      form.setValue("receiptUrl", res.url);
      setReceiptPreview(URL.createObjectURL(file));
      toast({ title: "Receipt uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-secondary/50 rounded-md hover:bg-secondary text-secondary-foreground transition-colors hover-elevate">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Log Expense</h2>
          <p className="text-muted-foreground">Record a new transaction to a project</p>
        </div>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="bg-secondary/5 border-b border-border">
          <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-border focus:ring-primary">
                          <SelectValue placeholder={projLoading ? "Loading projects..." : "Select project"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-border focus:ring-primary">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" className="h-12 font-display text-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="vendor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor / Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Home Depot, Sunbelt Rentals, etc." className="h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What was purchased and why?" className="resize-none min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-3">
                <FormLabel>Receipt Image (Optional)</FormLabel>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/5 relative">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  ) : receiptPreview ? (
                    <div className="flex flex-col items-center w-full">
                       <img src={receiptPreview} alt="Receipt preview" className="max-h-[150px] object-contain mb-4 rounded border border-border shadow-sm" />
                       <Button type="button" variant="outline" size="sm" onClick={() => { setReceiptPreview(null); form.setValue('receiptUrl', ''); }}>
                         Remove Image
                       </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-secondary rounded-full mb-3 text-secondary-foreground">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Click to upload receipt</p>
                      <p className="text-xs text-muted-foreground mb-4">PNG, JPG up to 5MB</p>
                      <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto hover-elevate active-elevate-2 px-8 font-bold" 
                  disabled={createMutation.isPending || uploading}
                >
                  {createMutation.isPending ? "SAVING..." : "SAVE EXPENSE"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
