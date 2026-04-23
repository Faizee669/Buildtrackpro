import React, { useState, useEffect } from 'react';
import { 
  Plus, RefreshCw, AlertCircle, TrendingUp, TrendingDown,
  Clock, Search, Building2, Users, Package, FileText, LayoutDashboard,
  CheckCircle2, XCircle, MoreVertical, Maximize2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data
const KPIS = [
  { label: "Total Spent", value: "Rs. 4,25,50,000", sub: "vs 5Cr budget", trend: "up", color: "text-amber-600" },
  { label: "Est. Profit", value: "Rs. 85,00,000", sub: "projected", trend: "up", color: "text-emerald-600" },
  { label: "Avg Margin", value: "18.2%", sub: "-2.1% from target", trend: "down", color: "text-rose-600" },
  { label: "Active Sites", value: "4", sub: "1 at risk", trend: "neutral", color: "text-blue-600" },
];

const PROJECTS = [
  { id: 1, name: "Mall Renovation - Gulberg", spent: 12500000, budget: 15000000, margin: 15.4, daysActive: 142, status: "On Track" },
  { id: 2, name: "Sea View Villa - Karachi", spent: 8500000, budget: 8000000, margin: -2.1, daysActive: 89, status: "Over Budget" },
  { id: 3, name: "Highway Bridge - M2", spent: 22000000, budget: 35000000, margin: 22.5, daysActive: 310, status: "On Track" },
  { id: 4, name: "Office Tower - DHA", spent: 4500000, budget: 12000000, margin: 18.0, daysActive: 45, status: "At Risk" },
  { id: 5, name: "Commercial Plaza - Phase 6", spent: 9800000, budget: 10000000, margin: 8.5, daysActive: 210, status: "Over Budget" },
  { id: 6, name: "Luxury Apartments - F-11", spent: 15000000, budget: 25000000, margin: 19.2, daysActive: 180, status: "On Track" },
  { id: 7, name: "Hospital Wing - Johar Town", spent: 3200000, budget: 8000000, margin: 16.5, daysActive: 30, status: "On Track" },
];

const CATEGORIES = [
  { name: "Materials", amount: "Rs. 2.1Cr", percent: 45, color: "bg-[#a63500]" },
  { name: "Labor", amount: "Rs. 1.2Cr", percent: 28, color: "bg-[#d95a2b]" },
  { name: "Equipment", amount: "Rs. 45L", percent: 12, color: "bg-[#e88d6a]" },
  { name: "Subcontractors", amount: "Rs. 30L", percent: 8, color: "bg-[#f2bda8]" },
  { name: "Other", amount: "Rs. 20.5L", percent: 7, color: "bg-slate-300" },
];

const INSIGHTS = [
  { type: "warning", text: "Steel prices up 4% this week. Consider locking in rates for Highway Bridge project." },
  { type: "alert", text: "Sea View Villa is 6% over budget on materials. Immediate review required." },
  { type: "success", text: "Labor efficiency at DHA Tower is 12% above baseline. Good performance." }
];

export function SplitConsole() {
  const [time, setTime] = useState("");
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + " PKT");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full h-[900px] bg-[#f1f3f9] text-slate-800 font-sans overflow-hidden">
      {/* Top Status Bar */}
      <div className="h-10 bg-slate-900 text-slate-200 flex items-center justify-between px-4 text-[13px] shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-white tracking-wide">BUILDTRACK PRO+</div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-mono text-emerald-400">Live · {time}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-800 border border-slate-700">
            <span className="text-slate-400">CUR:</span>
            <span className="font-medium text-white">PKR (Rs)</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-slate-600">
              <AvatarFallback className="bg-slate-700 text-[10px]">ZA</AvatarFallback>
            </Avatar>
            <span>Zain Ahmed</span>
          </div>
          <Button size="sm" className="h-7 bg-[#a63500] hover:bg-[#852a00] text-white border-0 rounded text-[12px] px-3 font-medium h-7">
            <Plus className="w-3 h-3 mr-1" /> New Expense
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANE: Financials (38%) */}
        <div className="w-[38%] border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-100 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />
              Financial Overview
            </h2>
            
            {/* 2x2 KPI Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {KPIS.map((kpi, i) => (
                <div key={i} className="p-3 border border-slate-100 rounded-md bg-slate-50/50 flex flex-col justify-between">
                  <div className="text-[12px] text-slate-500 font-medium">{kpi.label}</div>
                  <div className="mt-1 mb-1">
                    <div className="text-xl font-bold font-mono tracking-tight text-slate-800">{kpi.value}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{kpi.sub}</span>
                    {kpi.trend === 'up' && <TrendingUp className={`w-3 h-3 ${kpi.color}`} />}
                    {kpi.trend === 'down' && <TrendingDown className={`w-3 h-3 ${kpi.color}`} />}
                    {kpi.trend === 'neutral' && <MoreVertical className={`w-3 h-3 ${kpi.color}`} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Category Breakdown */}
            <h3 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-3">Spend by Category</h3>
            <div className="mb-2">
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {CATEGORIES.map(c => (
                  <div key={c.name} className={`${c.color} h-full`} style={{ width: `${c.percent}%` }} title={c.name}></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {CATEGORIES.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.color}`}></div>
                      <span className="text-slate-600 truncate w-20">{c.name}</span>
                    </div>
                    <span className="font-mono font-medium text-slate-700">{c.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Advisor Panel (Bottom of Left Pane) */}
          <div className="mt-auto bg-slate-900 text-slate-200 p-4 shrink-0 border-t-4 border-[#a63500]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <div className="bg-[#a63500] p-1 rounded">
                  <Maximize2 className="w-3 h-3 text-white" />
                </div>
                AI Cost Advisor
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {INSIGHTS.map((insight, i) => (
                <div key={i} className="flex gap-2 p-2 rounded bg-slate-800/50 border border-slate-700/50 text-[12px] leading-snug">
                  {insight.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                  {insight.type === 'alert' && <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                  <span className="text-slate-300">{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Work Surface (62%) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f3f9]">
          <Tabs defaultValue="projects" className="w-full flex flex-col h-full">
            <div className="bg-white border-b border-slate-200 px-4 pt-3 shrink-0">
              <TabsList className="h-9 bg-transparent p-0 w-full justify-start gap-6 rounded-none border-b-0">
                <TabsTrigger 
                  value="projects" 
                  className="data-[state=active]:border-[#a63500] data-[state=active]:text-[#a63500] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 h-9 text-[13px] font-semibold tracking-wide uppercase shadow-none"
                >
                  <Building2 className="w-3.5 h-3.5 mr-2" /> Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="crew" 
                  className="data-[state=active]:border-[#a63500] data-[state=active]:text-[#a63500] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 h-9 text-[13px] font-semibold tracking-wide uppercase shadow-none"
                >
                  <Users className="w-3.5 h-3.5 mr-2" /> Crew
                </TabsTrigger>
                <TabsTrigger 
                  value="materials" 
                  className="data-[state=active]:border-[#a63500] data-[state=active]:text-[#a63500] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 h-9 text-[13px] font-semibold tracking-wide uppercase shadow-none"
                >
                  <Package className="w-3.5 h-3.5 mr-2" /> Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="data-[state=active]:border-[#a63500] data-[state=active]:text-[#a63500] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 pb-2 h-9 text-[13px] font-semibold tracking-wide uppercase shadow-none"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" /> Recent Expenses
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects" className="flex-1 flex m-0 overflow-hidden outline-none data-[state=inactive]:hidden">
              
              {/* Project List (Left side of right pane) */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-[#a63500]/10 text-[#a63500] hover:bg-[#a63500]/20 rounded border-0 text-[11px] font-semibold px-2.5 cursor-pointer">All Active (4)</Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-300 hover:bg-slate-100 rounded text-[11px] font-medium px-2.5 cursor-pointer">At Risk (1)</Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-300 hover:bg-slate-100 rounded text-[11px] font-medium px-2.5 cursor-pointer">Over Budget (2)</Badge>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <Input className="h-7.5 w-48 pl-8 text-[12px] bg-white border-slate-300 rounded" placeholder="Search projects..." />
                  </div>
                </div>

                {/* Dense Data Table */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex-1 flex flex-col shadow-sm">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                    <div>Project</div>
                    <div>Spent / Budget</div>
                    <div className="text-right">Margin</div>
                    <div className="text-right">Days</div>
                    <div className="text-right">Status</div>
                  </div>
                  <ScrollArea className="flex-1">
                    {PROJECTS.map(proj => {
                      const isOverBudget = proj.spent > proj.budget;
                      const progress = Math.min((proj.spent / proj.budget) * 100, 100);
                      const formatRs = (num: number) => {
                        if (num >= 10000000) return \`\${(num/10000000).toFixed(2)}Cr\`;
                        return \`\${(num/100000).toFixed(2)}L\`;
                      };

                      return (
                        <div 
                          key={proj.id}
                          onClick={() => setActiveProject(proj)}
                          className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr] px-3 py-3 border-b border-slate-100 text-[12px] items-center cursor-pointer transition-colors ${activeProject.id === proj.id ? 'bg-[#a63500]/5' : 'hover:bg-slate-50'}`}
                        >
                          <div className="font-medium text-slate-800 truncate pr-2">{proj.name}</div>
                          <div className="pr-4">
                            <div className="flex justify-between text-[11px] mb-1 font-mono">
                              <span className={isOverBudget ? 'text-rose-600 font-medium' : 'text-slate-700'}>{formatRs(proj.spent)}</span>
                              <span className="text-slate-400">{formatRs(proj.budget)}</span>
                            </div>
                            <Progress value={progress} className={`h-1.5 ${isOverBudget ? '[&>div]:bg-rose-500' : '[&>div]:bg-slate-800'}`} />
                          </div>
                          <div className={`text-right font-mono font-medium ${proj.margin < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {proj.margin > 0 ? '+' : ''}{proj.margin.toFixed(1)}%
                          </div>
                          <div className="text-right font-mono text-slate-500">{proj.daysActive}</div>
                          <div className="text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                              proj.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 
                              proj.status === 'At Risk' ? 'bg-amber-100 text-amber-700' : 
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                </div>
              </div>

              {/* Mini Detail Panel (Right side of right pane) */}
              <div className="w-[280px] bg-white border-l border-slate-200 shrink-0 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <Badge variant="outline" className="mb-2 text-[10px] uppercase font-bold text-slate-500 bg-white border-slate-200 rounded">Selected Project</Badge>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{activeProject.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: PRJ-{activeProject.id.toString().padStart(4, '0')} · {activeProject.daysActive} days active</p>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-5">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Financial Health</div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                        <div className="flex justify-between items-end mb-2">
                          <div className="text-[11px] text-slate-500">Spent</div>
                          <div className={`font-mono text-sm font-bold ${activeProject.spent > activeProject.budget ? 'text-rose-600' : 'text-slate-800'}`}>
                            Rs. {(activeProject.spent).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-[11px] text-slate-500">Budget</div>
                          <div className="font-mono text-sm font-bold text-slate-800">
                            Rs. {(activeProject.budget).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                          <div className="text-[11px] text-slate-500">Margin</div>
                          <Badge variant="secondary" className={`rounded text-[11px] font-mono font-bold ${activeProject.margin < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {activeProject.margin > 0 ? '+' : ''}{activeProject.margin.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-2">Recent Activity</div>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <FileText className="w-3 h-3 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-[12px] text-slate-700 leading-snug">Invoice #4421 approved for <strong>Lucky Cement</strong></div>
                            <div className="text-[10px] text-slate-400 mt-0.5">2 hours ago</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          </div>
                          <div>
                            <div className="text-[12px] text-slate-700 leading-snug">Labor cost exceeded weekly estimate by 8%</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Yesterday</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-slate-100 bg-white">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded text-[12px] h-8 font-medium">
                    View Full Details
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Placeholder for other tabs */}
            <TabsContent value="crew" className="flex-1 m-0 p-4 data-[state=inactive]:hidden flex items-center justify-center text-slate-400 text-sm">
              Crew management interface would appear here.
            </TabsContent>
            <TabsContent value="materials" className="flex-1 m-0 p-4 data-[state=inactive]:hidden flex items-center justify-center text-slate-400 text-sm">
              Material inventory and ordering interface would appear here.
            </TabsContent>
            <TabsContent value="expenses" className="flex-1 m-0 p-4 data-[state=inactive]:hidden flex items-center justify-center text-slate-400 text-sm">
              Recent expense feed would appear here.
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
