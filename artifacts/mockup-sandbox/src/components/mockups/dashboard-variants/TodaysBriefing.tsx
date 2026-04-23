import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  CloudSun,
  MapPin,
  Search,
  Truck,
  Users,
  HardHat,
  FileText,
  Hammer,
  CreditCard,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export function TodaysBriefing() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9ff] text-slate-900 font-sans">
      {/* Top Strip */}
      <header className="flex-none h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-lg text-[#a63500]">
            <HardHat className="h-5 w-5" />
            <span>BuildTrack Pro+</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Tuesday, October 24</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CloudSun className="h-4 w-4 text-blue-500" />
            <span>28°C Clear</span>
            <span className="text-slate-400 text-xs ml-1">• Mall Renovation – Gulberg</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md ml-8">
          <div className="relative w-full">
            <Sparkles className="absolute left-2.5 top-2 h-4 w-4 text-[#a63500]" />
            <Input
              placeholder="Ask AI: What's the status of Highway Bridge?"
              className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#a63500]"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Action Items */}
        <aside className="w-[30%] min-w-[320px] max-w-[400px] border-r bg-white flex flex-col">
          <div className="p-6 pb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">Action Items</h2>
            <p className="text-sm text-slate-500 mb-4">Requires your attention today</p>
          </div>
          
          <ScrollArea className="flex-1 px-6">
            <div className="flex flex-col gap-4 pb-6">
              
              {/* Urgent Item */}
              <div className="group relative rounded-xl border border-red-100 bg-red-50/50 p-4 transition-all hover:bg-red-50">
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="bg-[#a63500] hover:bg-[#a63500]/90">Urgent</Badge>
                </div>
                <div className="flex gap-3 mb-3">
                  <div className="mt-0.5 rounded-full bg-red-100 p-1.5 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="pr-12">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">Mall site exceeded 80% budget</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">Currently at Rs. 45,20,000 (82% of Rs. 55,00,000). Labor costs are running high.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-slate-500">Mall Renovation – Gulberg</span>
                  <Button size="sm" className="bg-[#a63500] hover:bg-[#8a2c00] text-white h-8">
                    Review
                  </Button>
                </div>
              </div>

              {/* Standard Items */}
              <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="flex gap-3 mb-3">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">Approve Cement PO</h3>
                    <p className="text-sm text-slate-600 mt-1">Rs. 4,20,000 to Lucky Cement</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-slate-500">Sea View Villa – Karachi</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">Reject</Button>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white h-8">Approve</Button>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="flex gap-3 mb-3">
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">Crew Payroll Due Friday</h3>
                    <p className="text-sm text-slate-600 mt-1">Rs. 1,85,000 for 12 workers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-slate-500">Highway Bridge – M2</span>
                  <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Process Payment
                  </Button>
                </div>
              </div>

              <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="flex gap-3 mb-3">
                  <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">Missing Receipts</h3>
                    <p className="text-sm text-slate-600 mt-1">3 transport expenses missing documentation.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-slate-500">Multiple Projects</span>
                  <Button size="sm" variant="outline" className="h-8">
                    Remind Foreman
                  </Button>
                </div>
              </div>

              {/* Completed */}
              <div className="relative rounded-xl border border-slate-100 bg-slate-50 p-4 opacity-60">
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex gap-3 mb-3">
                  <div className="mt-0.5 rounded-full bg-slate-200 p-1.5 text-slate-500">
                    <Hammer className="h-4 w-4" />
                  </div>
                  <div className="pr-8">
                    <h3 className="font-semibold text-slate-700 text-sm leading-snug line-through">Equipment Rental Renewal</h3>
                    <p className="text-sm text-slate-500 mt-1">Rs. 85,000 to Pak Elektron</p>
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>
        </aside>

        {/* Right Column: The Feed */}
        <section className="flex-1 bg-[#f8f9ff] flex flex-col relative">
          <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-multiply" />
          
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-1 tracking-tight">Project Feed</h2>
            <p className="text-sm text-slate-500">Activity, expenses, and insights across all sites</p>
          </div>

          <ScrollArea className="flex-1 px-8 pb-8">
            <div className="max-w-3xl">
              
              {/* Today Section */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Today</h3>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  
                  {/* Event 1 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-blue-500">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 font-normal">Materials</Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> 8:32 AM</span>
                        </div>
                        <span className="font-semibold text-slate-900">Rs. 4,20,000</span>
                      </div>
                      <p className="text-slate-800 font-medium">Cement delivery logged</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400"/> Sea View Villa – Karachi</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-400"/> Lucky Cement</span>
                      </div>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-emerald-500">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-normal">Labor</Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> 10:15 AM</span>
                        </div>
                        <span className="font-semibold text-slate-900">Rs. 1,85,000</span>
                      </div>
                      <p className="text-slate-800 font-medium">Crew payment processed</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400"/> Mall Renovation – Gulberg</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI Advisor</span>
                        </div>
                        <span className="text-xs text-purple-400 flex items-center gap-1"><Clock className="h-3 w-3"/> 11:45 AM</span>
                      </div>
                      <p className="text-purple-900 font-medium leading-relaxed">Labor cost is up 12% week-over-week across all active sites.</p>
                      <p className="text-purple-700 text-sm mt-2">This is likely due to overtime at the Highway Bridge project to meet the Phase 1 deadline. Recommendation: Review scheduling to minimize premium overtime rates.</p>
                      <Button variant="outline" size="sm" className="mt-4 border-purple-200 text-purple-700 hover:bg-purple-100 h-8">
                        View Labor Report
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Yesterday Section */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Yesterday</h3>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  
                  {/* Alert */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-red-200 flex items-center justify-center text-red-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 font-normal">Budget Alert</Badge>
                        </div>
                      </div>
                      <p className="text-slate-900 font-medium">Mall Renovation exceeded 80% of total budget</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400"/> Gulberg Site</span>
                        <span>Total spent: <strong className="text-slate-900">Rs. 45,20,000</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Standard Event */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-normal">Permits</Badge>
                        </div>
                        <span className="font-semibold text-slate-900">Rs. 15,000</span>
                      </div>
                      <p className="text-slate-800 font-medium">City council inspection fee paid</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400"/> Office Tower – DHA</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* This Week Overview */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">This Week's Summary</h3>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <Card className="shadow-none border-slate-200 bg-white">
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-500 mb-1">Total Spent</div>
                      <div className="text-2xl font-bold text-slate-900">Rs. 12,45,000</div>
                      <div className="text-xs text-emerald-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" /> 4% under projected
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-none border-slate-200 bg-white">
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-500 mb-1">Active Projects</div>
                      <div className="text-2xl font-bold text-slate-900">4</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" /> All on schedule
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </ScrollArea>
        </section>

      </main>
    </div>
  );
}
