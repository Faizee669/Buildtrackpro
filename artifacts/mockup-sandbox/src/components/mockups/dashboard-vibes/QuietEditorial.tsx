import React from "react";
import {
  Menu,
  HardHat,
  Search,
  Bell,
  PlusCircle,
  AlertTriangle,
  Lightbulb,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Receipt,
  ArrowRight,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuietEditorial() {
  return (
    <div 
      className="min-h-[900px] font-sans antialiased" 
      style={{ 
        backgroundColor: "#faf8f3", 
        color: "#1a1814",
      }}
    >
      {/* 1. Sticky header */}
      <header 
        className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
        style={{ borderBottom: "1px solid #ebe6dc", backgroundColor: "rgba(250, 248, 243, 0.9)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-4">
          <button className="p-1 hover:opacity-70 transition-opacity">
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-semibold tracking-tight">BuildTrack Pro+</span>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div 
            className="flex items-center w-full px-3 py-1.5 rounded-full"
            style={{ border: "1px solid #ebe6dc", backgroundColor: "#fff" }}
          >
            <Search className="w-4 h-4 opacity-40 mr-2" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:opacity-40"
              style={{ color: "#1a1814" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-1 hover:opacity-70 transition-opacity">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#a63500" }} />
          </button>
          
          <select 
            className="text-sm bg-transparent border-none focus:outline-none cursor-pointer font-medium"
            style={{ color: "#1a1814" }}
            defaultValue="PKR"
          >
            <option value="PKR">🇵🇰 PKR</option>
            <option value="USD">🇺🇸 USD</option>
          </select>

          <Button 
            className="hidden sm:flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium rounded-none hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#1a1814", color: "#faf8f3" }}
          >
            <PlusCircle className="w-4 h-4" strokeWidth={1.5} />
            Add Expense
          </Button>
        </div>
      </header>

      {/* 2. Horizontal nav */}
      <nav 
        className="flex items-center gap-8 px-6 overflow-x-auto"
        style={{ borderBottom: "1px solid #ebe6dc" }}
      >
        {["Dashboard", "Projects", "Expenses", "Crew", "Inventory", "Job & Site", "Analytics"].map((item) => (
          <button
            key={item}
            className="whitespace-nowrap py-3 text-sm transition-colors relative"
            style={{ 
              color: item === "Dashboard" ? "#1a1814" : "rgba(26, 24, 20, 0.5)",
              fontWeight: item === "Dashboard" ? 500 : 400,
            }}
          >
            {item}
            {item === "Dashboard" && (
              <span 
                className="absolute bottom-0 left-0 w-full h-[1px]"
                style={{ backgroundColor: "#a63500" }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* 3. Body content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* a. Page heading row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 
              className="text-4xl tracking-tight mb-2"
              style={{ fontFamily: "'Playfair Display', 'Lora', serif" }}
            >
              Project Overview
            </h1>
            <p style={{ color: "rgba(26, 24, 20, 0.6)" }} className="text-sm">
              Real-time finances across all your job sites
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="h-auto py-2 px-4 rounded-none text-sm font-medium hover:bg-transparent"
              style={{ borderColor: "#ebe6dc", color: "#1a1814", backgroundColor: "transparent" }}
            >
              New Project
            </Button>
            <Button 
              className="h-auto py-2 px-4 rounded-none text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: "#1a1814", color: "#faf8f3" }}
            >
              Add Expense
            </Button>
          </div>
        </div>

        {/* b. KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-px" style={{ backgroundColor: "#ebe6dc" }}>
          {[
            { label: "TOTAL SPENT", value: "Rs 82.7 L", sub: "of Rs 1.01 Cr budget" },
            { label: "TOTAL REVENUE", value: "Rs 1.01 Cr", sub: "Estimated, all projects" },
            { label: "TOTAL PROFIT", value: "Rs 18.4 L", sub: "Revenue − Expenses", accent: true, margin: "+18.2%" },
            { label: "ACTIVE PROJECTS", value: "4", sub: "View all →" },
            { label: "BUDGET REMAINING", value: "Rs 24.3 L", sub: "Progress", progress: 81 },
          ].map((kpi, i) => (
            <div key={i} className="p-6 flex flex-col" style={{ backgroundColor: "#faf8f3" }}>
              <span className="text-[10px] tracking-widest font-medium uppercase mb-8" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
                {kpi.label}
              </span>
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-light tracking-tight tabular-nums">{kpi.value}</span>
                  {kpi.accent && (
                    <span className="text-xs font-medium" style={{ color: "#a63500" }}>{kpi.margin}</span>
                  )}
                </div>
                {kpi.progress ? (
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-full" style={{ backgroundColor: "#ebe6dc" }}>
                      <div className="h-[1px]" style={{ width: `${kpi.progress}%`, backgroundColor: "#1a1814" }} />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: "rgba(26, 24, 20, 0.5)" }}>{kpi.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* c. AI Cost Advisor */}
        <div className="relative py-8 pl-8 pr-6" style={{ borderLeft: "1px solid #1a1814" }}>
          <div className="absolute -left-[5px] top-8" style={{ color: "#1a1814" }}>✦</div>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="lg:w-1/4">
              <h2 className="text-sm font-medium mb-1" style={{ fontFamily: "'Playfair Display', 'Lora', serif" }}>Editor's Note</h2>
              <p className="text-xs mb-4" style={{ color: "rgba(26, 24, 20, 0.6)" }}>Live insights from your spending patterns</p>
              <button className="text-xs underline hover:opacity-70 transition-opacity uppercase tracking-widest" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
                Refresh
              </button>
            </div>
            <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: "WARNING", text: "Labor costs on Highway Bridge are 12% above your last 3 projects at this phase." },
                { type: "TIP", text: "You spent Rs 80K extra on cement this month — Lucky Cement raised prices 8%. Consider Maple as a backup." },
                { type: "INFO", text: "Mall Renovation phase 2 is your most profitable project this quarter at 24% margin." },
              ].map((insight, i) => (
                <div key={i} className="text-sm leading-relaxed">
                  <span className="text-[10px] tracking-widest font-medium uppercase block mb-2" style={{ color: insight.type === "TIP" ? "#a63500" : "rgba(26, 24, 20, 0.5)" }}>
                    {insight.type}
                  </span>
                  <p style={{ color: "#1a1814" }}>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* d. Two-column row: Category + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Category */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-8" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              Spending by Category
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Minimal SVG Donut */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ebe6dc" strokeWidth="1" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a1814" strokeWidth="1" strokeDasharray="251.2" strokeDashoffset="170" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(26, 24, 20, 0.6)" strokeWidth="1" strokeDasharray="251.2" strokeDashoffset="190" transform="rotate(115, 50, 50)" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(26, 24, 20, 0.3)" strokeWidth="1" strokeDasharray="251.2" strokeDashoffset="205" transform="rotate(200, 50, 50)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <span className="text-xs" style={{ color: "rgba(26, 24, 20, 0.5)" }}>100%</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {[
                  { name: "Cement", pct: "32%", amount: "Rs 26.4 L" },
                  { name: "Labour", pct: "24%", amount: "Rs 19.8 L" },
                  { name: "Steel", pct: "18%", amount: "Rs 14.8 L" },
                  { name: "Bricks", pct: "9%", amount: "Rs 7.4 L" },
                  { name: "Paint", pct: "7%", amount: "Rs 5.7 L" },
                  { name: "Other", pct: "10%", amount: "Rs 8.2 L" },
                ].map(cat => (
                  <div key={cat.name} className="flex justify-between items-center text-sm border-b pb-2" style={{ borderBottomColor: "#ebe6dc" }}>
                    <span style={{ color: "#1a1814" }}>{cat.name}</span>
                    <div className="flex gap-4 text-right">
                      <span className="w-10" style={{ color: "rgba(26, 24, 20, 0.5)" }}>{cat.pct}</span>
                      <span className="w-20 tabular-nums">{cat.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-8" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              Spending Trend
            </h3>
            <div className="h-48 w-full relative">
              <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d overflow-visible">
                {/* Thin grid lines */}
                <line x1="0" y1="0" x2="400" y2="0" stroke="#ebe6dc" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#ebe6dc" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#ebe6dc" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="#ebe6dc" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Sketched line */}
                <polyline 
                  points="0,120 33,110 66,130 100,90 133,80 166,100 200,60 233,50 266,70 300,40 333,30 366,45 400,20" 
                  fill="none" 
                  stroke="#1a1814" 
                  strokeWidth="1" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] tracking-widest" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
                <span>APR 25</span>
                <span>SEP 25</span>
                <span>MAR 26</span>
              </div>
            </div>
          </div>
        </div>

        {/* e. Two-column row: Budgets vs Spent + Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8" style={{ borderTop: "1px solid #ebe6dc" }}>
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-8" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              Project Budgets vs. Spent
            </h3>
            <div className="space-y-6">
              {[
                { name: "Highway Bridge M2", spent: 85, budget: 100 },
                { name: "Mall Renovation", spent: 60, budget: 100 },
                { name: "Sea View Villa", spent: 90, budget: 100 },
                { name: "DHA Plaza", spent: 40, budget: 100 },
              ].map(proj => (
                <div key={proj.name}>
                  <div className="flex justify-between text-xs mb-2">
                    <span>{proj.name}</span>
                    <span className="tabular-nums">{proj.spent}%</span>
                  </div>
                  <div className="h-[2px] w-full relative" style={{ backgroundColor: "#ebe6dc" }}>
                    <div className="absolute left-0 top-0 h-full" style={{ width: `${proj.spent}%`, backgroundColor: "#1a1814" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-8" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              Top Vendors
            </h3>
            <div className="space-y-6">
              {[
                { name: "Lucky Cement", val: 100, amount: "Rs 12.5 L" },
                { name: "Al-Karam Steel", val: 80, amount: "Rs 9.2 L" },
                { name: "Master Paints", val: 60, amount: "Rs 6.1 L" },
                { name: "Faisal Hardware", val: 40, amount: "Rs 4.0 L" },
                { name: "City Sand Co", val: 30, amount: "Rs 2.8 L" },
              ].map(vendor => (
                <div key={vendor.name} className="flex items-center gap-4">
                  <div className="w-32 text-xs truncate">{vendor.name}</div>
                  <div className="flex-1 h-[2px] relative" style={{ backgroundColor: "transparent" }}>
                    <div className="absolute left-0 top-0 h-full" style={{ width: `${vendor.val}%`, backgroundColor: "rgba(26, 24, 20, 0.2)" }} />
                  </div>
                  <div className="w-20 text-xs text-right tabular-nums">{vendor.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* f. Recent Expenses */}
        <div className="pt-8" style={{ borderTop: "1px solid #ebe6dc" }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              Recent Expenses
            </h3>
            <a href="#" className="text-xs uppercase tracking-widest underline" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              View All
            </a>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-12 text-xs mb-4 uppercase tracking-widest" style={{ color: "rgba(26, 24, 20, 0.5)" }}>
              <div className="col-span-4">Vendor</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Category</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="space-y-0" style={{ borderTop: "1px solid #ebe6dc" }}>
              {[
                { vendor: "Lucky Cement", project: "Highway Bridge M2", date: "Oct 24, 2023", cat: "Cement", amount: "Rs 4,50,000" },
                { vendor: "Al-Karam Steel", project: "Mall Renovation", date: "Oct 23, 2023", cat: "Steel", amount: "Rs 8,20,000" },
                { vendor: "Weekly Payroll", project: "Sea View Villa", date: "Oct 22, 2023", cat: "Labour", amount: "Rs 2,15,000" },
                { vendor: "Master Paints", project: "DHA Plaza", date: "Oct 20, 2023", cat: "Paint", amount: "Rs 1,80,000" },
                { vendor: "Faisal Hardware", project: "Highway Bridge M2", date: "Oct 19, 2023", cat: "Other", amount: "Rs 45,000" },
                { vendor: "City Sand Co", project: "Sea View Villa", date: "Oct 18, 2023", cat: "Other", amount: "Rs 90,000" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 text-sm py-4 items-center" style={{ borderBottom: "1px solid #ebe6dc" }}>
                  <div className="col-span-4 font-medium">{row.vendor}</div>
                  <div className="col-span-3" style={{ color: "rgba(26, 24, 20, 0.6)" }}>{row.project}</div>
                  <div className="col-span-2 tabular-nums" style={{ color: "rgba(26, 24, 20, 0.6)" }}>{row.date}</div>
                  <div className="col-span-1">
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm" style={{ backgroundColor: "#ebe6dc" }}>
                      {row.cat}
                    </span>
                  </div>
                  <div className="col-span-2 text-right tabular-nums font-medium">{row.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
