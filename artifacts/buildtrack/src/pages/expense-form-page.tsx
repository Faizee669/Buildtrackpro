import { useState, useRef } from "react"
import { useLocation } from "wouter"
import { useCreateExpense, useListProjects, useUploadReceipt } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { UploadCloud, Receipt, Loader2, ArrowLeft, Scan, CheckCircle2 } from "lucide-react"
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
  const [scanning, setScanning] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [ocrDetected, setOcrDetected] = useState<{ amount?: string; vendor?: string; date?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const runOcr = async (file: File) => {
    setScanning(true);
    setOcrDetected(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const detected: { amount?: string; vendor?: string; date?: string } = {};

      const amountMatch = text.match(/(?:total|amount|due|paid)[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i)
        || text.match(/\$\s*([\d,]+\.\d{2})/);
      if (amountMatch) {
        const raw = amountMatch[1].replace(/,/g, "");
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
          detected.amount = raw;
          form.setValue("amount", parsed);
        }
      }

      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) {
        try {
          const parts = dateMatch[1].split(/[\/\-]/);
          if (parts.length === 3) {
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            const iso = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            if (!isNaN(new Date(iso).getTime())) {
              detected.date = iso;
              form.setValue("date", iso);
            }
          }
        } catch {}
      }

      const vendorMatch = text.split('\n').slice(0, 5).find(line => 
        line.trim().length > 2 && line.trim().length < 50 && /[a-zA-Z]/.test(line)
      );
      if (vendorMatch && !form.getValues('vendor')) {
        const vendor = vendorMatch.trim().replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
        if (vendor.length > 2) {
          detected.vendor = vendor;
          form.setValue("vendor", vendor);
        }
      }

      setOcrDetected(Object.keys(detected).length > 0 ? detected : null);
      
      if (Object.keys(detected).length > 0) {
        toast({ 
          title: "Receipt scanned!", 
          description: `Detected: ${[detected.amount ? `$${detected.amount}` : null, detected.vendor, detected.date].filter(Boolean).join(", ")}` 
        });
      } else {
        toast({ title: "Scan complete", description: "Could not auto-detect fields. Enter manually.", variant: "default" });
      }
    } catch (err) {
      console.error("OCR error:", err);
      toast({ title: "OCR scan failed", description: "Please enter details manually.", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const [uploadRes] = await Promise.all([
        uploadMutation.mutateAsync({ data: { file } }),
        runOcr(file),
      ]);
      form.setValue("receiptUrl", uploadRes.url);
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

              {/* Receipt Upload + OCR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">Receipt Image (Optional)</label>
                  {ocrDetected && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fields auto-filled from receipt
                    </div>
                  )}
                </div>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/5 relative">
                  {uploading || scanning ? (
                    <div className="flex flex-col items-center gap-3">
                      {scanning ? (
                        <>
                          <div className="relative">
                            <Scan className="w-10 h-10 text-primary animate-pulse" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Scanning receipt with OCR...</span>
                          <span className="text-xs text-muted-foreground">Extracting amount, vendor & date</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </>
                      )}
                    </div>
                  ) : receiptPreview ? (
                    <div className="flex flex-col items-center w-full gap-3">
                      <img src={receiptPreview} alt="Receipt preview" className="max-h-[150px] object-contain rounded border border-border shadow-sm" />
                      {ocrDetected && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {ocrDetected.amount && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">Amount: ${ocrDetected.amount}</span>}
                          {ocrDetected.vendor && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">Vendor: {ocrDetected.vendor}</span>}
                          {ocrDetected.date && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">Date: {ocrDetected.date}</span>}
                        </div>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => { 
                        setReceiptPreview(null); 
                        form.setValue('receiptUrl', ''); 
                        setOcrDetected(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}>
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-secondary rounded-full mb-3 text-secondary-foreground">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Click to upload receipt</p>
                      <p className="text-xs text-muted-foreground mb-2">PNG, JPG up to 5MB — OCR will auto-fill fields</p>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Scan className="w-3.5 h-3.5" />
                        OCR powered by Tesseract.js
                      </div>
                      <Input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleFileUpload} 
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto hover-elevate active-elevate-2 px-8 font-bold" 
                  disabled={createMutation.isPending || uploading || scanning}
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
