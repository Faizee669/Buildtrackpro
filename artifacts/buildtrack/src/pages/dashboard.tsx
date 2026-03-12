import { useGetDashboardStats, useGetSpendingByCategory, useGetSpendingByProject, useGetSpendingTrend, useGetRecentExpenses } from "@workspace/api-client-react"
import { formatCurrency, CATEGORY_COLORS } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts"
import { format, parseISO } from "date-fns"
import { Receipt, HardHat, TrendingDown, DollarSign, ArrowRight, Loader2, Wallet } from "lucide-react"
import { Link } from "wouter"

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categorySpending, isLoading: catLoading } = useGetSpendingByCategory();
  const { data: projectSpending, isLoading: projLoading } = useGetSpendingByProject();
  const { data: trend, isLoading: trendLoading } = useGetSpendingTrend();
  const { data: recent, isLoading: recentLoading } = useGetRecentExpenses();

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-md">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">of {formatCurrency(stats.totalBudget)} budget</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
                <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.remainingBudget)}</p>
              </div>
              <div className="p-3 bg-secondary/10 text-secondary-foreground rounded-md">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${budgetProgress > 90 ? 'bg-destructive' : 'bg-secondary-foreground'}`} 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-l-accent hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Spent This Month</p>
                <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.spentThisMonth)}</p>
              </div>
              <div className="p-3 bg-accent/20 text-accent-foreground rounded-md">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              Across {stats.totalExpenses} recent transactions
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <Card className="col-span-1 shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Spending by Category</CardTitle>
            <CardDescription>Distribution of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {categorySpending && categorySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="category"
                      stroke="none"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || 'var(--color-chart-7)'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.35rem' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-foreground text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
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
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(val) => `$${val/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Spent']}
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
                    <YAxis dataKey="projectName" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} width={100} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
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

        {/* Recent Expenses List */}
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
                          <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(expense.amount)}</p>
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
    </div>
  )
}
