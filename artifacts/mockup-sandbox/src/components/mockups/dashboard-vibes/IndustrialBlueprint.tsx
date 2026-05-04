import React from "react";
import {
  Menu,
  Search,
  Bell,
  HardHat,
  Plus,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Info,
  DollarSign,
  TrendingUp,
  Banknote,
  Wallet,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_TABS = [
  "Dashboard",
  "Projects",
  "Expenses",
  "Crew",
  "Inventory",
  "Job & Site",
  "Analytics",
];

const KPIS = [
  {
    label: "Total Spent",
    value: "Rs 8,27,000",
    sub: "of Rs 1,01,50,000 budget",
    fig: "FIG. 01.A",
  },
  {
    label: "Total Revenue",
    value: "Rs 1,01,00,000",
    sub: "estimated",
    fig: "FIG. 01.B",
  },
  {
    label: "Total Profit",
    value: "Rs 18,40,000",
    sub: "│←─ +18.2% margin ─→│",
    fig: "FIG. 01.C",
    positive: true,
  },
  { label: "Active Projects", value: "4", sub: "across 3 sites", fig: "FIG. 01.D" },
  {
    label: "Budget Remaining",
    value: "Rs 24,30,000",
    sub: "│←─ 81% of budget ─→│",
    fig: "FIG. 01.E",
  },
];

const AI_INSIGHTS = [
  {
    type: "WARNING",
    text: "Labor costs on Highway Bridge are 12% above your last 3 projects at this phase.",
  },
  {
    type: "TIP",
    text: "You spent Rs 80K extra on cement this month — Lucky Cement raised prices 8%. Consider Maple as a backup.",
  },
  {
    type: "INFO",
    text: "Mall Renovation phase 2 is your most profitable project this quarter at 24% margin.",
  },
];

const SPENDING_CAT = [
  { cat: "Cement", pct: 32 },
  { cat: "Labour", pct: 24 },
  { cat: "Steel", pct: 18 },
  { cat: "Bricks", pct: 9 },
  { cat: "Paint", pct: 7 },
  { cat: "Other", pct: 10 },
];

const RECENT_EXPENSES = [
  {
    vendor: "Lucky Cement",
    project: "Highway Bridge M2",
    date: "24 Apr 2025",
    amount: "Rs 4,50,000",
    cat: "Cement",
  },
  {
    vendor: "Al-Karam Steel",
    project: "Mall Renovation",
    date: "23 Apr 2025",
    amount: "Rs 2,15,000",
    cat: "Steel",
  },
  {
    vendor: "Daily Wages",
    project: "Sea View Villa",
    date: "22 Apr 2025",
    amount: "Rs 85,000",
    cat: "Labour",
  },
  {
    vendor: "Master Paints",
    project: "DHA Plaza",
    date: "20 Apr 2025",
    amount: "Rs 42,000",
    cat: "Paint",
  },
  {
    vendor: "City Sand Co",
    project: "Highway Bridge M2",
    date: "19 Apr 2025",
    amount: "Rs 28,000",
    cat: "Other",
  },
  {
    vendor: "Faisal Hardware",
    project: "Mall Renovation",
    date: "18 Apr 2025",
    amount: "Rs 15,000",
    cat: "Other",
  },
];

const PROJECT_SPENDING = [
  { name: "Highway Bridge M2", spent: 85, budget: 100 },
  { name: "Mall Renovation", spent: 60, budget: 90 },
  { name: "Sea View Villa", spent: 45, budget: 50 },
  { name: "DHA Plaza", spent: 20, budget: 40 },
];

const TOP_VENDORS = [
  { name: "Lucky Cement", amount: 95 },
  { name: "Al-Karam Steel", amount: 75 },
  { name: "Master Paints", amount: 45 },
  { name: "Faisal Hardware", amount: 35 },
  { name: "City Sand Co", amount: 25 },
];

export function IndustrialBlueprint() {
  return (
    <div
      className="min-h-[900px] w-full text-[#0f172a] font-sans relative"
      style={{
        backgroundColor: "#eef2f6",
        backgroundImage: `
          linear-gradient(rgba(30,41,59,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,41,59,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "16px 16px",
      }}
    >
      <style>{`
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .grid-bg { background-image: linear-gradient(rgba(30,41,59,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.06) 1px, transparent 1px); background-size: 16px 16px; }
      `}</style>

      {/* SVG Definitions for hatched patterns */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="hatch-primary" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#0f172a" strokeWidth="1" />
          </pattern>
          <pattern id="hatch-secondary" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#f97316" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>

      {/* Header */}
      <header className="h-16 border-b border-[#0f172a] bg-[#eef2f6]/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 cursor-pointer" />
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5" />
            <span className="font-bold tracking-widest uppercase text-sm">
              BuildTrack Pro+
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center border border-[#0f172a] bg-white px-3 py-1 w-64">
          <Search className="w-4 h-4 text-[#0f172a]" />
          <input
            type="text"
            placeholder="SEARCH..."
            className="w-full bg-transparent border-none focus:outline-none text-xs uppercase tracking-widest mono ml-2 placeholder:text-[#0f172a]/50"
          />
        </div>

        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 cursor-pointer" />
          <div className="border border-[#0f172a] px-2 py-1 text-xs mono bg-white uppercase font-bold">
            CUR: PKR
          </div>
          <Button className="rounded-none border border-[#0f172a] bg-[#f97316] text-white hover:bg-[#ea580c] uppercase tracking-widest text-xs h-8">
            <Plus className="w-4 h-4 mr-1" /> Add Expense
          </Button>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-dashed border-[#0f172a]/40 bg-[#eef2f6]/90 sticky top-16 z-20 flex px-6 overflow-x-auto hide-scrollbar">
        {NAV_TABS.map((tab, idx) => (
          <div
            key={tab}
            className={`px-4 py-3 text-xs tracking-widest uppercase cursor-pointer border-b-2 whitespace-nowrap font-bold ${
              tab === "Dashboard"
                ? "border-[#f97316] text-[#f97316]"
                : "border-transparent text-[#0f172a]/60 hover:text-[#0f172a]"
            }`}
          >
            {tab}
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b-2 border-[#0f172a]">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase">
              Project Overview
            </h1>
            <p className="mono text-xs text-[#0f172a]/70 mt-1 uppercase tracking-wide">
              Real-time finances across all your job sites
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-none border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a]/5 tracking-widest uppercase text-xs h-8"
            >
              <HardHat className="w-4 h-4 mr-1" /> New Project
            </Button>
            <Button className="rounded-none border border-[#0f172a] bg-[#f97316] text-white hover:bg-[#ea580c] tracking-widest uppercase text-xs h-8">
              <Receipt className="w-4 h-4 mr-1" /> Add Expense
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {KPIS.map((kpi, idx) => (
            <div
              key={idx}
              className="border border-[#0f172a] bg-white p-3 relative flex flex-col justify-between h-28"
            >
              {/* Corner crosshairs */}
              <div className="absolute -top-[3px] -left-[3px] text-[#0f172a] text-[8px] leading-none">✛</div>
              <div className="absolute -top-[3px] -right-[3px] text-[#0f172a] text-[8px] leading-none">✛</div>
              <div className="absolute -bottom-[3px] -left-[3px] text-[#0f172a] text-[8px] leading-none">✛</div>
              <div className="absolute -bottom-[3px] -right-[3px] text-[#0f172a] text-[8px] leading-none">✛</div>

              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  {kpi.label}
                </span>
                <span className="mono text-[9px] text-[#0f172a]/50">
                  {kpi.fig}
                </span>
              </div>
              <div>
                <div
                  className={`mono text-lg font-bold ${
                    kpi.positive ? "text-[#15803d]" : "text-[#0f172a]"
                  }`}
                >
                  {kpi.value}
                </div>
                {idx === 4 ? (
                  <div className="mt-1">
                    <div className="w-full h-2 border border-[#0f172a] bg-white p-[1px]">
                      <div className="h-full w-[81%] bg-[#f97316]" style={{ background: "url(#hatch-secondary)" }}></div>
                    </div>
                    <div className="mono text-[9px] text-[#0f172a]/60 mt-1 whitespace-nowrap text-center">
                      {kpi.sub}
                    </div>
                  </div>
                ) : (
                  <div className="mono text-[9px] text-[#0f172a]/60 whitespace-nowrap mt-1">
                    {kpi.sub}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Cost Advisor */}
        <div className="border-2 border-[#0f172a] bg-white relative p-5">
          <div className="border-b border-dashed border-[#0f172a] pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                MEMO 04/26 — COST ADVISORY
              </h2>
              <p className="mono text-[10px] text-[#0f172a]/60 uppercase mt-1">
                Live insights from your spending patterns
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-[#0f172a] text-[#0f172a] uppercase tracking-widest text-[10px] h-7 px-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>

          <div className="space-y-2 mono text-xs">
            {AI_INSIGHTS.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#f97316] font-bold mt-0.5">▸</span>
                <div>
                  <span
                    className={`font-bold mr-2 ${
                      insight.type === "WARNING"
                        ? "text-[#b91c1c]"
                        : insight.type === "TIP"
                        ? "text-[#15803d]"
                        : "text-[#0f172a]"
                    }`}
                  >
                    [{insight.type}]
                  </span>
                  {insight.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Category & Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-[#0f172a] bg-white p-4 relative">
            {/* Ruler Ticks */}
            <div className="absolute top-0 left-0 right-0 h-1 flex justify-between px-1">
              {[...Array(20)].map((_, i) => <div key={i} className="w-[1px] h-[3px] bg-[#0f172a]/30" />)}
            </div>

            <h3 className="text-sm font-bold tracking-widest uppercase border-b border-dashed border-[#0f172a] pb-2 mb-4">
              Spending by Category
            </h3>
            <div className="flex gap-4 h-48">
              {/* Fake Donut SVG */}
              <div className="w-1/2 flex items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-full h-full max-h-40 transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#eef2f6" strokeWidth="15" />
                  {/* Cement 32% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#hatch-primary)" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 32) / 100} />
                  {/* Labour 24% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#0f172a" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 24) / 100} className="origin-center rotate-[115deg]" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="2 4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center mono text-[10px] font-bold">
                  100%
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-2 mono text-xs">
                {SPENDING_CAT.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-dotted border-[#0f172a]/20 pb-1">
                    <span className="uppercase">{cat.cat}</span>
                    <span className="font-bold">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-[#0f172a] bg-white p-4 relative grid-bg">
            <h3 className="text-sm font-bold tracking-widest uppercase border-b border-dashed border-[#0f172a] pb-2 mb-4 bg-white inline-block pr-2">
              Spending Trend
            </h3>
            <div className="h-48 w-full relative flex items-end pb-6 pt-4">
              {/* Stepped Line Chart Mock */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[20, 40, 60, 80].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#0f172a" strokeWidth="0.2" strokeDasharray="1 2" />
                ))}
                <polyline
                  points="0,80 10,80 10,70 20,70 20,90 30,90 30,50 40,50 40,60 50,60 50,30 60,30 60,40 70,40 70,20 80,20 80,40 90,40 90,10 100,10"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {/* Dots at step points */}
                <circle cx="10" cy="70" r="1.5" fill="#f97316" />
                <circle cx="30" cy="50" r="1.5" fill="#f97316" />
                <circle cx="50" cy="30" r="1.5" fill="#f97316" />
                <circle cx="70" cy="20" r="1.5" fill="#f97316" />
                <circle cx="90" cy="10" r="1.5" fill="#f97316" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex justify-between mono text-[8px] uppercase font-bold text-[#0f172a]/60 bg-white">
                <span>APR</span>
                <span>JUL</span>
                <span>OCT</span>
                <span>JAN</span>
                <span>MAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Budgets vs Spent & Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-[#0f172a] bg-white p-4 relative">
             <h3 className="text-sm font-bold tracking-widest uppercase border-b border-dashed border-[#0f172a] pb-2 mb-4">
              Project Budgets vs. Spent
            </h3>
            <div className="space-y-4">
              {PROJECT_SPENDING.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between mono text-[10px] uppercase font-bold mb-1">
                    <span>{proj.name}</span>
                    <span>{proj.spent}%</span>
                  </div>
                  <div className="w-full h-3 border border-[#0f172a] p-[1px] relative bg-white">
                    <div className="absolute top-[1px] left-[1px] bottom-[1px] bg-[#eef2f6]" style={{ width: `${proj.budget}%` }}></div>
                    <div className="absolute top-[1px] left-[1px] bottom-[1px] bg-[#0f172a]" style={{ width: `${proj.spent}%`, background: "url(#hatch-primary)" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#0f172a] bg-white p-4 relative">
            <h3 className="text-sm font-bold tracking-widest uppercase border-b border-dashed border-[#0f172a] pb-2 mb-4">
              Top Vendors
            </h3>
            <div className="space-y-3">
              {TOP_VENDORS.map((vendor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="mono text-[10px] font-bold w-4">{i + 1}.</div>
                  <div className="flex-1">
                    <div className="mono text-[10px] uppercase mb-1">{vendor.name}</div>
                    <div className="w-full h-1.5 bg-[#eef2f6] border-y border-[#0f172a]">
                      <div className="h-full bg-[#0f172a]" style={{ width: `${vendor.amount}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="border border-[#0f172a] bg-white relative">
          <div className="p-4 border-b border-dashed border-[#0f172a] flex justify-between items-center bg-[#f8fafc]">
            <h3 className="text-sm font-bold tracking-widest uppercase">
              Recent Expenses
            </h3>
            <span className="mono text-[10px] underline cursor-pointer uppercase font-bold">
              View All ✛
            </span>
          </div>
          <div className="divide-y divide-dashed divide-[#0f172a]/30">
            {RECENT_EXPENSES.map((exp, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-[#eef2f6]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="border border-[#0f172a] p-2 bg-white hidden sm:block">
                    <Receipt className="w-4 h-4 text-[#0f172a]" />
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wide">{exp.vendor}</div>
                    <div className="mono text-[10px] text-[#0f172a]/70 flex gap-2 uppercase mt-0.5">
                      <span>{exp.project}</span>
                      <span>|</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-sm font-bold">{exp.amount}</div>
                  <div className="mono text-[9px] uppercase border border-[#0f172a] px-1 py-0.5 inline-block mt-1 bg-white">
                    {exp.cat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
