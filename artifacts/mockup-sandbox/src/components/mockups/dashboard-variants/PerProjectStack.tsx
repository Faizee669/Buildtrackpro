import React from "react";
import { 
  Building2, 
  MapPin, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Wallet, 
  ChevronRight, 
  Plus, 
  Users, 
  Sparkles,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PROJECTS = [
  {
    id: 1,
    name: "Mall Renovation",
    location: "Gulberg, Lahore",
    status: "On Track",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    budget: 50000000,
    spent: 32000000,
    thisWeekSpent: 1200000,
    profit: "18%",
    daysToMilestone: 14,
    alerts: ["Materials delivery delayed by 2 days"],
    categories: [
      { name: "Materials", percent: 45, color: "bg-blue-500" },
      { name: "Labor", percent: 30, color: "bg-amber-500" },
      { name: "Equipment", percent: 15, color: "bg-purple-500" },
      { name: "Misc", percent: 10, color: "bg-slate-300" },
    ]
  },
  {
    id: 2,
    name: "Sea View Villa",
    location: "Karachi",
    status: "Over Budget",
    statusColor: "bg-red-100 text-red-800 border-red-200",
    budget: 85000000,
    spent: 78000000,
    thisWeekSpent: 3400000,
    profit: "8%",
    daysToMilestone: 3,
    alerts: ["Labor 8% over plan", "Cement order pending approval"],
    categories: [
      { name: "Materials", percent: 55, color: "bg-blue-500" },
      { name: "Labor", percent: 35, color: "bg-amber-500" },
      { name: "Equipment", percent: 5, color: "bg-purple-500" },
      { name: "Misc", percent: 5, color: "bg-slate-300" },
    ]
  },
  {
    id: 3,
    name: "Highway Bridge",
    location: "M2 Motorway",
    status: "At Risk",
    statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    budget: 120000000,
    spent: 45000000,
    thisWeekSpent: 800000,
    profit: "12%",
    daysToMilestone: 28,
    alerts: ["Pending NOC from highway authority"],
    categories: [
      { name: "Materials", percent: 40, color: "bg-blue-500" },
      { name: "Labor", percent: 20, color: "bg-amber-500" },
      { name: "Equipment", percent: 30, color: "bg-purple-500" },
      { name: "Misc", percent: 10, color: "bg-slate-300" },
    ]
  },
  {
    id: 4,
    name: "Office Tower",
    location: "DHA Phase 8",
    status: "On Track",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    budget: 200000000,
    spent: 15000000,
    thisWeekSpent: 450000,
    profit: "22%",
    daysToMilestone: 45,
    alerts: [],
    categories: [
      { name: "Materials", percent: 30, color: "bg-blue-500" },
      { name: "Labor", percent: 10, color: "bg-amber-500" },
      { name: "Equipment", percent: 10, color: "bg-purple-500" },
      { name: "Misc", percent: 50, color: "bg-slate-300" },
    ]
  }
];

const AI_INSIGHTS = [
  {
    title: "Material Cost Spike",
    description: "Steel prices from Ittehad Steel are up 4% this month. Consider bulk ordering for the Office Tower project.",
    action: "Review Steel Orders"
  },
  {
    title: "Labor Efficiency",
    description: "Sea View Villa is burning labor budget 12% faster than baseline. Likely due to weekend overtime.",
    action: "View Timesheets"
  },
  {
    title: "Cash Flow Alert",
    description: "You have Rs. 4.5M in pending invoices due next week, but only Rs. 3.2M allocated in the central account.",
    action: "Manage Funds"
  }
];

function formatRs(amount: number) {
  return "Rs. " + amount.toLocaleString("en-IN");
}

export function PerProjectStack() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] text-slate-900 font-sans flex flex-col items-center">
      {/* Global Summary Header */}
      <header className="w-full bg-white border-b border-slate-200 py-3 px-6 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#a63500] flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">BuildTrack <span className="text-[#a63500]">Pro+</span></h1>
        </div>
        
        <div className="flex items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          <span className="text-sm font-medium text-slate-600">
            <strong className="text-slate-900">4</strong> active sites
          </span>
          <span className="mx-3 text-slate-300">•</span>
          <span className="text-sm font-medium text-slate-600">
            <strong className="text-slate-900">Rs. 1.2 Cr</strong> deployed
          </span>
          <span className="mx-3 text-slate-300">•</span>
          <span className="text-sm font-medium text-[#a63500] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <strong>14%</strong> blended margin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-slate-200">
            Reports
          </Button>
          <Button className="bg-[#a63500] hover:bg-[#8a2c00] text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="w-full max-w-[1280px] flex-1 flex gap-6 p-6 mx-auto">
        
        {/* Left Column: Project Stack */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Active Projects</h2>
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <span>Sort by:</span>
              <select className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer">
                <option>Spend (High to Low)</option>
                <option>Status</option>
                <option>Name</option>
              </select>
            </div>
          </div>

          {PROJECTS.map(project => {
            const percentSpent = (project.spent / project.budget) * 100;
            const weekDeltaPercent = (project.thisWeekSpent / project.budget) * 100;
            
            return (
              <Card key={project.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden rounded-xl">
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col md:flex-row gap-6">
                    
                    {/* Identity & Status */}
                    <div className="md:w-1/4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${project.statusColor}`}>
                            {project.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{project.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm mt-1.5">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {project.location}
                        </div>
                      </div>
                      
                      {/* Alerts */}
                      <div className="mt-4 flex flex-col gap-2">
                        {project.alerts.length > 0 ? (
                          project.alerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-sm text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-100">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span className="leading-snug">{alert}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-2.5 py-1.5 rounded-md border border-green-100">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>All systems nominal</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financials & Progress */}
                    <div className="md:w-2/4 flex flex-col justify-center border-l border-slate-100 pl-6">
                      
                      {/* Budget Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Budget Utilized</p>
                            <p className="text-lg font-bold text-slate-900">
                              {formatRs(project.spent)} <span className="text-sm font-normal text-slate-500">/ {formatRs(project.budget)}</span>
                            </p>
                          </div>
                          <span className="font-bold text-slate-700">{percentSpent.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                          <div className="h-full bg-slate-800 relative z-10 rounded-r-sm" style={{ width: `${percentSpent - weekDeltaPercent}%` }} />
                          <div className="h-full bg-[#a63500] relative z-10 animate-pulse opacity-80 rounded-r-sm" style={{ width: `${weekDeltaPercent}%` }} title={`This week: ${formatRs(project.thisWeekSpent)}`} />
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] text-[#a63500] font-medium flex items-center">
                            +{formatRs(project.thisWeekSpent)} this week
                          </span>
                        </div>
                      </div>

                      {/* 3 Inline Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium uppercase">Spend Velocity</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{formatRs(project.thisWeekSpent)}<span className="text-xs font-normal text-slate-500">/wk</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium uppercase">Est. Profit</span>
                          </div>
                          <p className="text-sm font-bold text-emerald-600">{project.profit}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium uppercase">Next Milestone</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{project.daysToMilestone} Days</p>
                        </div>
                      </div>

                    </div>

                    {/* Actions & Sparkline */}
                    <div className="md:w-1/4 flex flex-col justify-between border-l border-slate-100 pl-6">
                      
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Spend Distribution</p>
                        <div className="h-2 w-full flex rounded-full overflow-hidden mb-2">
                          {project.categories.map((cat, i) => (
                            <div key={i} className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} title={`${cat.name}: ${cat.percent}%`} />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {project.categories.slice(0, 3).map((cat, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                              <span className="text-[10px] text-slate-600 font-medium">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <Button className="w-full justify-between bg-white border border-slate-200 hover:border-[#a63500] hover:bg-orange-50 text-slate-800 hover:text-[#a63500] transition-colors shadow-sm">
                          Add Expense <Plus className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" className="w-full text-xs h-8 bg-slate-50 border-slate-200">
                            Details
                          </Button>
                          <Button variant="outline" className="w-full text-xs h-8 bg-slate-50 border-slate-200">
                            Crew
                          </Button>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
        </div>

        {/* Right Rail: AI Insights */}
        <div className="w-[320px] shrink-0">
          <div className="sticky top-[88px]">
            <Card className="border border-indigo-100 shadow-md bg-gradient-to-b from-indigo-50/50 to-white overflow-hidden rounded-xl">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-[#a63500]" />
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">AI Advisor</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Cross-project analysis</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {AI_INSIGHTS.map((insight, idx) => (
                    <div key={idx} className="relative group">
                      {idx !== 0 && <div className="h-px w-full bg-slate-100 absolute -top-2" />}
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{insight.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {insight.description}
                      </p>
                      <button className="text-[11px] font-bold text-indigo-600 flex items-center hover:text-indigo-800 transition-colors uppercase tracking-wide">
                        {insight.action} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats or generic panel */}
            <Card className="mt-5 border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Top Vendors This Month</h3>
                <div className="space-y-3">
                  {[
                    { name: "Ittehad Steel", amount: "Rs. 4.2M" },
                    { name: "Lucky Cement", amount: "Rs. 2.8M" },
                    { name: "Master Tiles", amount: "Rs. 1.5M" },
                  ].map((v, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{v.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{v.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </main>
    </div>
  );
}
