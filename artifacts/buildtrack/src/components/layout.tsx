import { useState, useEffect } from "react"
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
import { LayoutDashboard, HardHat, Receipt, PlusCircle, LogOut, Loader2 } from "lucide-react"
import { useGetMe } from "@workspace/api-client-react"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: HardHat },
  { title: "Expenses", url: "/expenses", icon: Receipt },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false }
  });

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

  if (isError || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/auth-bg.png)` }}></div>
        <div className="z-10 flex flex-col items-center gap-6 bg-card p-10 rounded-xl shadow-2xl border border-border max-w-sm w-full mx-4">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <HardHat className="w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">BUILDTRACK</h2>
            <p className="text-muted-foreground text-sm">Construction Expense Manager</p>
          </div>
          <p className="text-center text-sm text-muted-foreground">Track project expenses, receipts, and budgets across all your job sites.</p>
          <a href="/api/auth/login" target="_top" className="w-full">
            <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-md shadow-lg transition-all active:scale-[0.98]">
              Sign in with Replit
            </button>
          </a>
        </div>
      </div>
    );
  }

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
            <div className="mb-6 px-2 group-data-[collapsible=icon]:hidden">
              <Link href="/add-expense" className="block">
                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  <PlusCircle className="w-5 h-5" />
                  <span>ADD EXPENSE</span>
                </button>
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
                {user.name?.[0] || 'U'}
              </div>
              <div className="flex flex-col flex-1 truncate">
                <span className="text-sm font-bold text-sidebar-foreground truncate">{user.name || 'User'}</span>
                <span className="text-xs text-sidebar-foreground/50 truncate">Contractor</span>
              </div>
              <a href="/api/auth/logout" target="_top" className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-2 rounded-md hover:bg-sidebar-accent">
                <LogOut className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
               <a href="/api/auth/logout" target="_top" className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-2 rounded-md hover:bg-sidebar-accent">
                <LogOut className="w-5 h-5" />
              </a>
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
            <div className="flex items-center gap-4">
               {/* Could add quick action icons or notifications here */}
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
