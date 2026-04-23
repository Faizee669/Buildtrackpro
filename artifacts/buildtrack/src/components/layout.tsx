import { Link, useLocation } from "wouter"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  HardHat,
  Receipt,
  PlusCircle,
  LogOut,
  Loader2,
  TrendingUp,
  Building2,
  Users,
  Package,
  Search,
  Bell,
  Menu,
} from "lucide-react"
import { useAuth } from "@workspace/replit-auth-web"
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency-context"
import { LoginPage } from "@/components/login-page"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: HardHat },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Crew", url: "/crew", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Job & Site", url: "/jobs", icon: Building2 },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
]

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const current = CURRENCIES.find((c) => c.code === currency)!
  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="appearance-none pl-7 pr-6 py-1.5 text-xs font-semibold rounded-full border border-border bg-muted text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        title="Select currency"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
        {current.flag}
      </span>
    </div>
  )
}

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle navigation menu"
      className="h-10 w-10 rounded-lg border border-card-border bg-card text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center flex-shrink-0"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: typeof navItems[number]
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.url}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-2.5 transition-all font-medium text-sm border-r-4 ${
        active
          ? "border-primary bg-accent text-primary"
          : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span>{item.title}</span>
    </Link>
  )
}

interface SidebarBodyProps {
  user: ReturnType<typeof useAuth>["user"]
  displayName: string
  initials: string
  location: string
  logout: () => void
}

function SidebarBody({ user, displayName, initials, location, logout }: SidebarBodyProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false)
  }
  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="bg-sidebar h-16 px-4 flex items-center border-b border-sidebar-border">
        <Link
          href="/dashboard"
          onClick={closeIfMobile}
          className="flex items-center gap-2 w-full overflow-hidden"
        >
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex-shrink-0 shadow-sm shadow-primary/30">
            <HardHat className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-tight text-foreground">
              BuildTrack <span className="text-primary">Pro+</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mt-0.5">
              Construction Mgmt
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <Link
            href="/add-expense"
            onClick={closeIfMobile}
            className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg shadow-md shadow-primary/20 hover:opacity-95 transition-opacity active:scale-[0.98] text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const active =
              location === item.url ||
              (item.url !== "/dashboard" && location.startsWith(item.url))
            return (
              <NavLink
                key={item.title}
                item={item}
                active={active}
                onNavigate={closeIfMobile}
              />
            )
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm overflow-hidden">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
            <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">
              Contractor
            </span>
          </div>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-muted"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-2xl shadow-lg border border-card-border">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl">
            <HardHat className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            BuildTrack <span className="text-primary">Pro+</span>
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onReplitLogin={login} />
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.email ?? "User"
  const initials = user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"
  const currentNav = navItems.find(
    (i) =>
      location === i.url || (i.url !== "/dashboard" && location.startsWith(i.url)),
  )

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <SidebarBody
        user={user}
        displayName={displayName}
        initials={initials}
        location={location}
        logout={logout}
      />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-card-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarToggleButton />
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm shadow-primary/30">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-extrabold text-base tracking-tight text-foreground">
                BuildTrack <span className="text-primary">Pro+</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center bg-muted rounded-full px-4 py-1.5 ml-4 max-w-xs flex-1">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full ml-2 placeholder:text-muted-foreground"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="hidden sm:block text-muted-foreground hover:text-primary transition-colors relative p-2 rounded-md hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <CurrencySelector />
            <Link href="/add-expense" className="hidden sm:block">
              <button className="gradient-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg shadow-md shadow-primary/20 hover:opacity-95 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Add Expense</span>
              </button>
            </Link>
            <Link href="/add-expense" className="sm:hidden">
              <button className="bg-primary text-primary-foreground p-2 rounded-md shadow-md">
                <PlusCircle className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </header>

        {/* Horizontal nav tabs */}
        <nav className="hidden md:flex items-center gap-1 px-4 sm:px-6 lg:px-8 border-b border-card-border bg-card/60 backdrop-blur-md sticky top-16 z-20 overflow-x-auto">
          {navItems.map((item) => {
            const active =
              location === item.url ||
              (item.url !== "/dashboard" && location.startsWith(item.url))
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
          <div className="ml-auto hidden lg:flex items-center text-xs text-muted-foreground font-medium">
            {currentNav?.title ?? "Overview"}
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
