import { useGetDashboardStats, useGetSpendingByCategory, useGetSpendingByProject, useGetSpendingTrend, useGetRecentExpenses, useGetTopVendors, useGetAiInsights, useLaborVsMaterial, useTopWorkers, useProfitByProject } from "@workspace/api-client-react"
import { CATEGORY_COLORS } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts"
import { Receipt, HardHat, TrendingDown, DollarSign, ArrowRight, Loader2, Wallet, Sparkles, RefreshCw, AlertTriangle, Lightbulb, Info, TrendingUp, Users, Banknote, Percent } from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { QuickAddDialog } from "@/components/quick-add-dialog"

export default function Dashboard() {
  const { fmt } = useCurrency();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categorySpending, isLoading: catLoading } = useGetSpendingByCategory();
  const { data: projectSpending, isLoading: projLoading } = useGetSpendingByProject();
  const { data: trend, isLoading: trendLoading } = useGetSpendingTrend();
  const { data: recent, isLoading: recentLoading } = useGetRecentExpenses();
  const { data: topVendors, isLoading: vendorsLoading } = useGetTopVendors();
  const { data: aiInsights, isLoading: aiLoading, refetch: refetchAI } = useGetAiInsights({ query: { staleTime: 0, refetchOnMount: false, enabled: false } });
  const { data: laborVsMaterial } = useLaborVsMaterial();
  const { data: topWorkers } = useTopWorkers();
  const { data: profitByProject } = useProfitByProject();

  const isLoading = statsLoading || catLoading || projLoading || trendLoading || recentLoading;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const budgetProgress = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;

  const insightIcon = (type: string) => {
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
    if (type === "tip") return <Lightbulb className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />;
    return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
  };

  const insightStyle = (type: string) => {
    if (type === "warning") return "border-amber-500/20 bg-amber-500/5";
    if (type === "tip") return "border-green-500/20 bg-green-500/5";
    return "border-blue-500/20 bg-blue-500/5";
  };

  const trendDataFormatted = trend?.map(t => ({
    ...t,
    month: t.month.replace(/(\w{3}) (\d{2})/, "$1 '$2"),
  })) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Dashboard header with Quick Add */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Overview of your project finances</p>
        </div>
        <div className="flex gap-2">
          <QuickAddDialog defaultTab="expense">
            <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/20 hover-elevate active-elevate-2">
              <Receipt className="w-4 h-4" />
              Add Expense
            </Button>
          </QuickAddDialog>
          <QuickAddDialog defaultTab="project">
            <Button size="lg" variant="outline" className="gap-2 font-semibold hover-elevate">
              <HardHat className="w-4 h-4" />
              New Project
            </Button>
          </QuickAddDialog>
        </div>
      </div>

      {/* Profit Snapshot — answers "Are we making money?" */}
      {(() => {
        const totalRevenue = stats.totalRevenue ?? 0;
        const totalProfit = stats.totalProfit ?? (totalRevenue - stats.totalSpent);
        const margin = stats.profitMargin ?? (totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0);
        const laborSpent = stats.laborSpent ?? 0;
        const materialSpent = stats.materialSpent ?? 0;
        const totalCost = laborSpent + materialSpent;
        const laborPct = totalCost > 0 ? (laborSpent / totalCost) * 100 : 0;
        const profitable = totalProfit >= 0;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-foreground">{fmt(totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md"><Banknote className="w-5 h-5" /></div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Estimated across all projects</p>
              </CardContent>
            </Card>
            <Card className={`bg-card shadow-sm border-l-4 ${profitable ? 'border-l-green-600' : 'border-l-destructive'} hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Profit</p>
                    <p className={`text-3xl font-display font-bold ${profitable ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>{fmt(totalProfit)}</p>
                  </div>
                  <div className={`p-3 rounded-md ${profitable ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                    {profitable ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Revenue − Total Expenses</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profit Margin</p>
                    <p className={`text-3xl font-display font-bold ${margin >= 0 ? 'text-foreground' : 'text-destructive'}`}>{margin.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md"><Percent className="w-5 h-5" /></div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{margin >= 20 ? 'Healthy' : margin >= 10 ? 'Acceptable' : margin >= 0 ? 'Tight' : 'At a loss'}</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Labor vs Material</p>
                    <p className="text-3xl font-display font-bold text-foreground">{laborPct.toFixed(0)}<span className="text-xl">%</span></p>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md"><Users className="w-5 h-5" /></div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Labor share of total costs</p>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                <p className="text-3xl font-display font-bold text-foreground">{fmt(stats.totalSpent)}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-md">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">of {fmt(stats.totalBudget)} budget</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
                <p className="text-3xl font-display font-bold text-foreground">{fmt(stats.remainingBudget)}</p>
              </div>
              <div className="p-3 bg-secondary/10 text-secondary-foreground rounded-md">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${budgetProgress > 90 ? 'bg-destructive' : budgetProgress > 80 ? 'bg-amber-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }} 
              />
            </div>
            {budgetProgress > 80 && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {budgetProgress.toFixed(0)}% budget used
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-accent hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Spent This Month</p>
                <p className="text-3xl font-display font-bold text-foreground">{fmt(stats.spentThisMonth)}</p>
              </div>
              <div className="p-3 bg-accent/20 text-accent-foreground rounded-md">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              Across {stats.totalExpenses} total transactions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-muted-foreground hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Projects</p>
                <p className="text-3xl font-display font-bold text-foreground">{stats.activeProjects}</p>
              </div>
              <div className="p-3 bg-muted text-muted-foreground rounded-md">
                <HardHat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Link href="/projects" className="text-primary font-medium flex items-center hover:underline">
                View all projects <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Cost Advisor */}
      <Card className="shadow-sm border border-border bg-gradient-to-br from-card to-secondary/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Cost Advisor</CardTitle>
              <CardDescription>AI-powered insights from your spending patterns</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAI()}
            disabled={aiLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {aiLoading ? (
            <div className="flex items-center gap-3 py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing your spending patterns...</span>
            </div>
          ) : aiInsights?.insights && aiInsights.insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiInsights.insights.map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${insightStyle(insight.type)}`}>
                  {insightIcon(insight.type)}
                  <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Click "Refresh" to generate AI insights from your data.</p>
            </div>
          )}
          {aiInsights?.generatedAt && (
            <p className="text-xs text-muted-foreground mt-3">
              Generated {format(parseISO(aiInsights.generatedAt), "MMM d 'at' h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <Card className="col-span-1 shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Spending by Category</CardTitle>
            <CardDescription>Distribution of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {categorySpending && categorySpending.length > 0 ? (() => {
                const total = categorySpending.reduce((s, e) => s + e.amount, 0);
                return (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categorySpending}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="amount"
                          nameKey="category"
                          stroke="none"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            if (percent < 0.05) return null;
                            const RADIAN = Math.PI / 180;
                            const r = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + r * Math.cos(-midAngle * RADIAN);
                            const y = cy + r * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          labelLine={false}
                        >
                          {categorySpending.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || 'var(--color-chart-7)'} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${fmt(value)} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, "Amount"]}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
                      {categorySpending.map((entry) => {
                        const pct = total > 0 ? ((entry.amount / total) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={entry.category} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || 'var(--color-chart-7)' }} />
                              <span className="text-muted-foreground truncate">{entry.category}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="font-semibold text-foreground">{pct}%</span>
                              <span className="text-muted-foreground">{fmt(entry.amount)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })() : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trend Line Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Spending Trend</CardTitle>
            <CardDescription>Monthly expenses over last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {trendDataFormatted.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendDataFormatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(val) => `$${val/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [fmt(value), 'Spent']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Bar Chart */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Budgets vs. Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {projectSpending && projectSpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectSpending} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="projectName" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }} width={110} />
                    <Tooltip 
                      formatter={(value: number) => fmt(value)}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="amount" name="Spent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    <Bar dataKey="budget" name="Budget" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors Chart */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Vendors</CardTitle>
            <CardDescription>Ranked by total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {vendorsLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : topVendors && topVendors.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topVendors} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="vendor" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }} width={110} />
                    <Tooltip 
                      formatter={(value: number, name: string) => name === "amount" ? fmt(value) : value}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                    />
                    <Bar dataKey="amount" name="Spent" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No vendor data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="shadow-sm border border-border flex flex-col">
        <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
          <Link href="/expenses" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {recent && recent.length > 0 ? (
              recent.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[expense.category] || 'var(--color-muted)'} 15%, transparent)` }}
                    >
                      <Receipt className="w-5 h-5" style={{ color: CATEGORY_COLORS[expense.category] || 'var(--color-muted-foreground)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[200px]">{expense.vendor || 'Unknown Vendor'}</p>
                      <p className="text-xs text-muted-foreground flex gap-2">
                        <span className="truncate max-w-[100px]">{expense.projectName}</span>
                        <span>•</span>
                        <span>{expense.date ? format(parseISO(expense.date), 'MMM d, yyyy') : 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{fmt(expense.amount)}</p>
                    <p className="text-xs px-2 py-0.5 rounded-full inline-block mt-1" style={{ 
                      backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[expense.category]} 10%, transparent)`,
                      color: CATEGORY_COLORS[expense.category] 
                    }}>
                      {expense.category}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Receipt className="w-8 h-8 opacity-20" />
                <p>No recent expenses found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
