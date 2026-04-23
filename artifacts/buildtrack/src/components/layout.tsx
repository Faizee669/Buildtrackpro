import { Link, useLocation } from "wouter"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar"
import { LayoutDashboard, HardHat, Receipt, PlusCircle, LogOut, Loader2, FolderPlus, TrendingUp, Building2 } from "lucide-react"
import { useAuth } from "@workspace/replit-auth-web"
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency-context"
import { LoginPage } from "@/components/login-page"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: HardHat },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Job & Site Mgmt", url: "/jobs", icon: Building2 },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
]

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const current = CURRENCIES.find(c => c.code === currency)!;
  return (
    <div className="relative">
      <select
        value={currency}
        onChange={e => setCurrency(e.target.value as CurrencyCode)}
        className="appearance-none pl-7 pr-6 py-1.5 text-xs font-semibold rounded-md border border-border bg-secondary/50 text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        title="Select currency"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
        {current.flag}
      </span>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/auth-bg.png)` }}></div>
        <div className="z-10 flex flex-col items-center gap-4 bg-card p-8 rounded-xl shadow-2xl border border-border">
          <HardHat className="w-12 h-12 text-primary animate-bounce" />
          <h2 className="text-2xl font-bold tracking-tight">BUILDTRACK</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onReplitLogin={login} />;
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : (user?.email ?? "User");

  const initials = user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border py-4 px-4 h-16 flex items-center bg-sidebar">
            <div className="flex items-center gap-3 w-full overflow-hidden">
              <div className="bg-primary text-primary-foreground p-1.5 rounded flex-shrink-0">
                <HardHat className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider truncate text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                BUILDTRACK
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-sidebar px-2 py-4">
            <div className="mb-4 px-2 space-y-2 group-data-[collapsible=icon]:hidden">
              <Link href="/add-expense" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-sm">
                <PlusCircle className="w-4 h-4" />
                <span>ADD EXPENSE</span>
              </Link>
              <Link href="/projects" className="w-full flex items-center justify-center gap-2 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2.5 px-4 rounded-md transition-all active:scale-[0.98] text-sm">
                <FolderPlus className="w-4 h-4" />
                <span>NEW PROJECT</span>
              </Link>
            </div>
            <div className="mb-4 px-2 hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
              <Link href="/add-expense" className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md" title="Add Expense">
                <PlusCircle className="w-5 h-5" />
              </Link>
              <Link href="/projects" className="p-2.5 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary rounded-md" title="New Project">
                <FolderPlus className="w-5 h-5" />
              </Link>
            </div>
            <SidebarGroup>
              <SidebarMenu className="gap-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.url || (item.url !== '/dashboard' && location.startsWith(item.url))}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors font-medium h-11"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
              <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0 text-secondary-foreground font-bold border border-sidebar-border">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={displayName} className="w-full h-full rounded object-cover" />
                ) : initials}
              </div>
              <div className="flex flex-col flex-1 truncate">
                <span className="text-sm font-bold text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-xs text-sidebar-foreground/50 truncate">Contractor</span>
              </div>
              <button onClick={logout} className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-2 rounded-md hover:bg-sidebar-accent">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <button onClick={logout} className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-2 rounded-md hover:bg-sidebar-accent">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 w-full min-w-0">
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover-elevate active-elevate-2 bg-secondary/50 text-secondary-foreground" />
              <h1 className="font-display text-xl font-bold text-foreground hidden sm:block">
                {navItems.find(i => location.startsWith(i.url))?.title || 'Overview'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector />
              <Link href="/add-expense" className="sm:hidden">
                <button className="bg-primary text-primary-foreground p-2 rounded-md shadow-md">
                  <PlusCircle className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
