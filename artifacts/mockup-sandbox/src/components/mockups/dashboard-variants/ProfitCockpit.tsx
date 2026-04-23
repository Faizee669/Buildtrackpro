import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Activity,
  ListFilter,
  PieChart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfitCockpit() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-[900px] h-screen flex flex-col bg-[#0b0f19] text-slate-50 font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#a63500] flex items-center justify-center shadow-[0_0_15px_rgba(166,53,0,0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">BuildTrack Pro+</span>
        </div>
        
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Sparkles className="h-4 w-4 text-[#a63500]" />
          </div>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-800 rounded-full leading-5 bg-[#131b2c] text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-[#1a243b] focus:ring-1 focus:ring-[#a63500] focus:border-[#a63500] sm:text-sm transition-all"
            placeholder="Ask the advisor: 'Why is my margin shrinking?'"
          />
        </div>
      </header>

      {/* Main Hero Cockpit - Top 60% */}
      <main className="flex-1 flex flex-col justify-center px-8 relative z-10">
        {/* Background abstract shape to simulate sparkline/trend */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 flex items-center justify-center">
          <svg className="w-full h-96 opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <path 
              d="M0,400 L0,300 C150,320 250,200 400,250 C550,300 650,150 800,100 C900,60 950,80 1000,20 L1000,400 Z" 
              fill="url(#trend-gradient)" 
            />
            <defs>
              <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute w-full h-96 opacity-60" preserveAspectRatio="none" viewBox="0 0 1000 400">
             <polyline 
              points="0,300 150,320 250,200 400,250 550,300 650,150 800,100 900,60 1000,20" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#131b2c] border border-slate-800 shadow-xl">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Current Profit</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 px-2 py-0.5">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                18.2% Margin
              </Badge>
            </div>
            
            <h1 className="text-[140px] leading-[0.9] font-bold text-white tracking-tighter" style={{ textShadow: '0 10px 40px rgba(16,185,129,0.1)' }}>
              Rs. 18.4 <span className="text-7xl text-slate-400 ml-[-10px]">L</span>
            </h1>
            
            <p className="text-2xl text-slate-400 font-light max-w-3xl mt-4">
              Profit is up <span className="text-emerald-400 font-medium">12%</span> this month — driven by 
              <span className="text-white font-medium"> Mall Renovation phase 2</span>.
            </p>
          </div>
        </div>
      </main>

      {/* Margin Eaters */}
      <div className="px-8 pb-10 z-10 max-w-7xl mx-auto w-full">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          What's eating your margin
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-[#131b2c]/80 border-rose-900/30 backdrop-blur overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-slate-200">Labor overrun</p>
                <p className="text-sm text-slate-400 mb-3">Highway Bridge – M2</p>
                <div className="text-xl font-semibold text-rose-400">-Rs. 2.1 L</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#131b2c]/80 border-amber-900/30 backdrop-blur overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-slate-200">Cement price spike</p>
                <p className="text-sm text-slate-400 mb-3">Lucky Cement (+8%)</p>
                <div className="text-xl font-semibold text-amber-400">-Rs. 80 K</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#131b2c]/80 border-rose-900/30 backdrop-blur overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-slate-200">Permit delay risk</p>
                <p className="text-sm text-slate-400 mb-3">Sea View Villa – Karachi</p>
                <div className="text-xl font-semibold text-rose-400">-Rs. 1.5 L</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom KPI Strip */}
      <footer className="bg-[#0f1523] border-t border-slate-800/60 px-8 py-5 flex-shrink-0 flex justify-between items-center z-10">
        <div className="flex gap-10 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</span>
            <span className="text-xl font-medium text-slate-200">Rs. 1.01 Cr</span>
          </div>
          
          <div className="w-px h-10 bg-slate-800/80"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Spent</span>
            <span className="text-xl font-medium text-slate-200">Rs. 82.7 L</span>
          </div>

          <div className="w-px h-10 bg-slate-800/80"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Budget Remaining</span>
            <span className="text-xl font-medium text-slate-200">Rs. 24.3 L</span>
          </div>

          <div className="w-px h-10 bg-slate-800/80"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Active Projects</span>
            <span className="text-xl font-medium text-slate-200">4</span>
          </div>

          <div className="w-px h-10 bg-slate-800/80"></div>
          
          <div className="flex gap-4">
             <Button variant="outline" size="sm" className="bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 h-9">
               <PieChart className="w-4 h-4 mr-2" />
               Categories
             </Button>
             <Button variant="outline" size="sm" className="bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 h-9">
               <ListFilter className="w-4 h-4 mr-2" />
               Recent Expenses
             </Button>
          </div>
        </div>
        
        <Button variant="ghost" className="text-[#a63500] hover:text-white hover:bg-[#a63500] transition-colors flex items-center gap-2 h-10 px-5 rounded-full font-medium">
          Detailed Ledger
          <ArrowRight className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}
