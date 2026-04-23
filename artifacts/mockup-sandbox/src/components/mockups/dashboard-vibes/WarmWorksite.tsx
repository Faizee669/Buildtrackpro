import React from "react";
import {
  HardHat,
  Menu,
  Search,
  Bell,
  PlusCircle,
  Receipt,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Wallet,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Info,
  RefreshCw,
  Banknote,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Projects", url: "/projects" },
  { title: "Expenses", url: "/expenses" },
  { title: "Crew", url: "/crew" },
  { title: "Inventory", url: "/inventory" },
  { title: "Job & Site", url: "/jobs" },
  { title: "Analytics", url: "/analytics" },
];

const categoryData = [
  { name: "Cement", pct: 32, color: "#c2410c" },
  { name: "Labour", pct: 24, color: "#9a3412" },
  { name: "Steel", pct: 18, color: "#7c2d12" },
  { name: "Bricks", pct: 9, color: "#ea580c" },
  { name: "Paint", pct: 7, color: "#4d7c0f" },
  { name: "Other", pct: 10, color: "#9ca3af" },
];

const projectBudgets = [
  { name: "Highway Bridge M2", spent: 4200, budget: 5000 },
  { name: "Mall Renovation", spent: 3800, budget: 4000 },
  { name: "Sea View Villa", spent: 1500, budget: 2500 },
  { name: "DHA Plaza", spent: 900, budget: 1200 },
];

const topVendors = [
  { name: "Lucky Cement", amount: 2400 },
  { name: "Al-Karam Steel", amount: 1800 },
  { name: "Master Paints", amount: 1200 },
  { name: "Faisal Hardware", amount: 800 },
  { name: "City Sand Co", amount: 500 },
];

const recentExpenses = [
  { vendor: "Lucky Cement", project: "Highway Bridge M2", date: "Oct 24, 2025", amount: "Rs 4,20,000", category: "Cement" },
  { vendor: "Ali Labour Contractor", project: "Mall Renovation", date: "Oct 23, 2025", amount: "Rs 1,85,000", category: "Labour" },
  { vendor: "Al-Karam Steel", project: "Highway Bridge M2", date: "Oct 22, 2025", amount: "Rs 8,50,000", category: "Steel" },
  { vendor: "City Sand Co", project: "Sea View Villa", date: "Oct 21, 2025", amount: "Rs 45,000", category: "Other" },
  { vendor: "Master Paints", project: "DHA Plaza", date: "Oct 20, 2025", amount: "Rs 1,12,000", category: "Paint" },
  { vendor: "Faisal Hardware", project: "Mall Renovation", date: "Oct 19, 2025", amount: "Rs 38,000", category: "Bricks" },
];

export function WarmWorksite() {
  return (
    <div className="min-h-[900px] w-full bg-[#f5efe6] text-[#292524] font-['DM_Sans',sans-serif] relative overflow-hidden flex flex-col">
      {/* Subtle stippled noise background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        
        .warm-card {
          background-color: #fffdfa;
          border: 1px solid #e7e0d6;
          border-radius: 16px;
          box-shadow: 0 4px 12px -4px rgba(194, 65, 12, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .masking-tape {
          background-color: #fdfbf7;
          border: 1px solid #e5dfd5;
          box-shadow: 1px 1px 3px rgba(124, 45, 18, 0.1);
          transform: rotate(-1deg);
        }
      `}} />

      {/* Sticky Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#e7e0d6] sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-md hover:bg-[#f5efe6] text-[#7c2d12] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-[#c2410c] text-[#fffdfa] p-1.5 rounded-lg shadow-sm transform -rotate-2">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#431407]">
              BuildTrack <span className="text-[#c2410c]">Pro+</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <Search className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search sites, expenses..." 
            className="w-full bg-[#f5efe6] border border-[#e7e0d6] rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#c2410c]/40 focus:ring-2 focus:ring-[#c2410c]/10 transition-all text-[#431407] placeholder:text-[#a8a29e]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 relative rounded-md hover:bg-[#f5efe6] text-[#7c2d12] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9f1239] rounded-full border-2 border-[#fffdfa]" />
          </button>
          
          <div className="relative">
            <select className="appearance-none bg-[#f5efe6] border border-[#e7e0d6] text-[#431407] text-sm font-semibold rounded-full pl-8 pr-6 py-1.5 hover:bg-[#e7e0d6] cursor-pointer focus:outline-none">
              <option>PKR</option>
            </select>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🇵🇰</span>
          </div>

          <Button className="hidden sm:flex bg-[#c2410c] hover:bg-[#9a3412] text-white gap-2 font-semibold shadow-md shadow-[#c2410c]/20 rounded-lg transform hover:-translate-y-0.5 transition-transform">
            <PlusCircle className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </header>

      {/* Horizontal Nav */}
      <nav className="h-12 flex items-center px-6 gap-6 bg-[#fffdfa]/80 backdrop-blur-sm border-b border-[#e7e0d6] sticky top-16 z-20 overflow-x-auto no-scrollbar">
        {navItems.map((item, i) => (
          <a 
            key={i} 
            href="#" 
            className={`text-sm font-medium whitespace-nowrap py-3 relative transition-colors ${
              i === 0 ? 'text-[#c2410c]' : 'text-[#78716c] hover:text-[#431407]'
            }`}
          >
            {item.title}
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c2410c] rounded-t-full" />
            )}
          </a>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 z-10 relative">
        
        {/* Page Heading Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#431407]">Project Overview</h1>
            <p className="text-[#78716c] mt-1 text-sm font-medium">Real-time finances across all your job sites</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-[#c2410c] hover:bg-[#9a3412] text-white gap-2 shadow-md shadow-[#c2410c]/20 rounded-lg font-semibold">
              <Receipt className="w-4 h-4" /> Add Expense
            </Button>
            <Button variant="outline" className="bg-[#fffdfa] border-[#e7e0d6] text-[#7c2d12] hover:bg-[#f5efe6] hover:text-[#431407] font-semibold gap-2 rounded-lg shadow-sm">
              <HardHat className="w-4 h-4" /> New Project
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Spent */}
          <div className="warm-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#fef08a] flex items-center justify-center text-[#c2410c] shadow-inner transform -rotate-3">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Total Spent</p>
              <h3 className="text-xl font-bold text-[#431407] mt-1">Rs 8,27,000</h3>
              <p className="text-xs text-[#78716c] mt-1 font-medium">of Rs 1,01,50,000 budget</p>
            </div>
          </div>
          
          {/* Revenue */}
          <div className="warm-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#bfdbfe] flex items-center justify-center text-[#0369a1] shadow-inner transform rotate-2">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-xl font-bold text-[#431407] mt-1">Rs 1,01,00,000</h3>
              <p className="text-xs text-[#78716c] mt-1 font-medium">Estimated, all projects</p>
            </div>
          </div>

          {/* Profit */}
          <div className="warm-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#d9f99d] flex items-center justify-center text-[#4d7c0f] shadow-inner transform -rotate-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#4d7c0f] bg-[#ecfccb] px-2 py-0.5 rounded-md transform rotate-1">+18.2%</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Total Profit</p>
              <h3 className="text-xl font-bold text-[#431407] mt-1">Rs 18,40,000</h3>
              <p className="text-xs text-[#78716c] mt-1 font-medium">Revenue − Expenses</p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="warm-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#fed7aa] flex items-center justify-center text-[#9a3412] shadow-inner transform rotate-3">
                <HardHat className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Active Projects</p>
              <h3 className="text-xl font-bold text-[#431407] mt-1">4</h3>
              <a href="#" className="text-xs text-[#c2410c] font-semibold hover:underline flex items-center gap-1 mt-1">
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Budget Remaining */}
          <div className="warm-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#fbcfe8] flex items-center justify-center text-[#c2410c] shadow-inner transform -rotate-1">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full">
              <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Budget Remaining</p>
              <h3 className="text-xl font-bold text-[#431407] mt-1">Rs 24,30,000</h3>
              <div className="w-full bg-[#e7e0d6] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#c2410c] h-full rounded-full w-[81%]" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Cost Advisor - Clipboard Style */}
        <div className="bg-[#fffdfa] border-2 border-[#c2410c] rounded-2xl shadow-[0_8px_24px_-8px_rgba(194,65,12,0.15)] relative overflow-hidden">
          {/* Top binder clip aesthetic */}
          <div className="absolute top-0 inset-x-0 h-4 bg-[#f5efe6] border-b border-[#e7e0d6] flex justify-center items-center">
            <div className="w-32 h-2 bg-[#d6cebf] rounded-full" />
          </div>
          
          <div className="p-6 pt-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Hand-drawn style sun/sparkle */}
                  <svg className="w-8 h-8 text-[#ea580c] transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.485-7.071l-1.414 1.414M6.929 17.657l-1.414 1.414M17.657 17.657l1.414 1.414M6.929 6.929L5.515 5.515" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#431407] font-serif tracking-tight">AI Cost Advisor</h2>
                  <p className="text-sm text-[#78716c] font-medium">Live insights from your site spending</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-[#f5efe6] border-[#e7e0d6] text-[#7c2d12] hover:bg-[#e7e0d6] hover:text-[#431407] font-semibold gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Note 1 - Warning */}
              <div className="masking-tape p-4 rounded-md relative group transition-transform hover:scale-[1.02] rotate-1">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#facc15]/30 -rotate-2" />
                <div className="flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 text-[#9f1239] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#431407] font-medium leading-relaxed">
                    Labor costs on Highway Bridge are 12% above your last 3 projects at this phase.
                  </p>
                </div>
              </div>

              {/* Note 2 - Tip */}
              <div className="masking-tape p-4 rounded-md relative group transition-transform hover:scale-[1.02] -rotate-1">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#facc15]/30 rotate-3" />
                <div className="flex gap-2.5 items-start">
                  <Lightbulb className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#431407] font-medium leading-relaxed">
                    You spent Rs 80K extra on cement this month — Lucky Cement raised prices 8%. Consider Maple as a backup.
                  </p>
                </div>
              </div>

              {/* Note 3 - Info */}
              <div className="masking-tape p-4 rounded-md relative group transition-transform hover:scale-[1.02] rotate-[1.5deg]">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#facc15]/30 -rotate-1" />
                <div className="flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-[#4d7c0f] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#431407] font-medium leading-relaxed">
                    Mall Renovation phase 2 is your most profitable project this quarter at 24% margin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row: Categories + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending by Category */}
          <div className="warm-card col-span-1 p-6">
            <h3 className="font-bold text-lg text-[#431407] mb-1">Spending by Category</h3>
            <p className="text-sm text-[#78716c] font-medium mb-6">Distribution of expenses</p>
            
            <div className="flex items-center justify-center mb-6">
              {/* Simple raw SVG donut chart */}
              <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {/* Cement 32% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#c2410c" strokeWidth="20" strokeDasharray="80.4 251.2" strokeDashoffset="0" />
                {/* Labour 24% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#9a3412" strokeWidth="20" strokeDasharray="60.3 251.2" strokeDashoffset="-80.4" />
                {/* Steel 18% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#7c2d12" strokeWidth="20" strokeDasharray="45.2 251.2" strokeDashoffset="-140.7" />
                {/* Bricks 9% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ea580c" strokeWidth="20" strokeDasharray="22.6 251.2" strokeDashoffset="-185.9" />
                {/* Paint 7% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#4d7c0f" strokeWidth="20" strokeDasharray="17.6 251.2" strokeDashoffset="-208.5" />
                {/* Other 10% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#9ca3af" strokeWidth="20" strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" />
              </svg>
            </div>
            
            <div className="space-y-3">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-[#57534e]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-[#431407]">{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Trend */}
          <div className="warm-card col-span-1 lg:col-span-2 p-6">
            <h3 className="font-bold text-lg text-[#431407] mb-1">Spending Trend</h3>
            <p className="text-sm text-[#78716c] font-medium mb-6">Monthly expenses over last 12 months</p>
            
            <div className="h-64 w-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-full border-t border-[#e7e0d6] border-dashed" />
                ))}
              </div>
              
              {/* Line chart area */}
              <div className="absolute inset-x-8 inset-y-0 pb-6">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="warmFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c2410c" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path 
                    d="M 0,35 Q 10,40 20,30 T 40,25 T 60,35 T 80,15 T 100,5 L 100,50 L 0,50 Z" 
                    fill="url(#warmFill)" 
                  />
                  
                  {/* Line */}
                  <path 
                    d="M 0,35 Q 10,40 20,30 T 40,25 T 60,35 T 80,15 T 100,5" 
                    fill="none" 
                    stroke="#c2410c" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {/* Data points */}
                  <circle cx="20" cy="30" r="1.5" fill="#fffdfa" stroke="#c2410c" strokeWidth="1" />
                  <circle cx="40" cy="25" r="1.5" fill="#fffdfa" stroke="#c2410c" strokeWidth="1" />
                  <circle cx="60" cy="35" r="1.5" fill="#fffdfa" stroke="#c2410c" strokeWidth="1" />
                  <circle cx="80" cy="15" r="1.5" fill="#fffdfa" stroke="#c2410c" strokeWidth="1" />
                  <circle cx="100" cy="5" r="1.5" fill="#fffdfa" stroke="#c2410c" strokeWidth="1" />
                </svg>
              </div>
              
              {/* X Axis labels */}
              <div className="absolute bottom-0 inset-x-8 flex justify-between text-xs font-medium text-[#a8a29e] translate-y-4">
                <span>Apr</span>
                <span>Jul</span>
                <span>Oct</span>
                <span>Jan</span>
                <span>Mar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row: Budgets vs Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Budgets */}
          <div className="warm-card p-6">
            <h3 className="font-bold text-lg text-[#431407] mb-6">Project Budgets vs. Spent</h3>
            
            <div className="space-y-6">
              {projectBudgets.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-[#57534e]">{proj.name}</span>
                    <span className="font-bold text-[#431407]">
                      Rs {proj.spent}k / <span className="text-[#a8a29e]">Rs {proj.budget}k</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#f5efe6] rounded-full overflow-hidden relative">
                    {/* Budget background is implicitly the gray bar */}
                    {/* Spent bar */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#c2410c] rounded-full transition-all" 
                      style={{ width: `${(proj.spent / proj.budget) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="warm-card p-6">
            <h3 className="font-bold text-lg text-[#431407] mb-1">Top Vendors</h3>
            <p className="text-sm text-[#78716c] font-medium mb-6">Ranked by total spending</p>
            
            <div className="space-y-4">
              {topVendors.map((vendor, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#57534e] block mb-1.5">{vendor.name}</span>
                    <div className="h-2 w-full bg-[#f5efe6] rounded-full overflow-hidden flex items-center">
                      <div 
                        className="h-full bg-[#7c2d12] rounded-full" 
                        style={{ width: `${(vendor.amount / 2400) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right pt-4">
                    <span className="font-bold text-[#431407] text-sm">Rs {vendor.amount}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="warm-card flex flex-col">
          <div className="p-6 pb-4 border-b border-[#e7e0d6] flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#431407]">Recent Expenses</h3>
            <button className="text-sm font-semibold text-[#c2410c] hover:text-[#9a3412] hover:underline">
              View All
            </button>
          </div>
          
          <div className="p-2">
            {recentExpenses.map((exp, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-[#fdfbf7] rounded-xl transition-colors border border-transparent hover:border-[#e7e0d6]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f5efe6] flex items-center justify-center flex-shrink-0 border border-[#e7e0d6] shadow-sm transform rotate-1">
                    <Receipt className="w-5 h-5 text-[#9a3412]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#431407] text-sm sm:text-base">{exp.vendor}</p>
                    <p className="text-xs text-[#78716c] font-medium flex gap-2 items-center mt-0.5">
                      <span>{exp.project}</span>
                      <span className="w-1 h-1 bg-[#d6cebf] rounded-full" />
                      <span>{exp.date}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="font-bold text-[#431407]">{exp.amount}</span>
                  <div className="masking-tape text-[10px] font-bold text-[#7c2d12] px-2.5 py-0.5 rounded shadow-sm inline-block">
                    {exp.category}
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
