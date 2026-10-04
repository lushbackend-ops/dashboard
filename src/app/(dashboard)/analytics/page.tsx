"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { ArrowUpRight, Users, Target, Activity, TrendingUp } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 45000, target: 40000 },
  { month: "Feb", revenue: 52000, target: 45000 },
  { month: "Mar", revenue: 48000, target: 50000 },
  { month: "Apr", revenue: 61000, target: 55000 },
  { month: "May", revenue: 59000, target: 60000 },
  { month: "Jun", revenue: 75000, target: 65000 },
];

const trafficData = [
  { day: "Mon", visitors: 1200 },
  { day: "Tue", visitors: 1350 },
  { day: "Wed", visitors: 1100 },
  { day: "Thu", visitors: 1600 },
  { day: "Fri", visitors: 1850 },
  { day: "Sat", visitors: 900 },
  { day: "Sun", visitors: 850 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page Identity & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Global Analytics</h1>
          <p className="text-[13px] text-secondary-foreground">Overview of key business metrics and AI performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="border border-border rounded-md px-3 py-1.5 text-[13px] bg-white">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-[13px] font-medium shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 border border-border rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block" title="Total processed leads">Total Leads</h3>
            <Users className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">4,291</span>
            <span className="text-[12px] font-medium text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
            </span>
          </div>
        </div>

        <div className="bg-card p-5 border border-border rounded-lg">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">Campaign ROI</h3>
            <Target className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">284%</span>
            <span className="text-[12px] font-medium text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 4.2%
            </span>
          </div>
        </div>

        <div className="bg-card p-5 border border-border rounded-lg">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">AI Automations</h3>
            <Activity className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">18.5k</span>
            <span className="text-[12px] font-medium text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 22%
            </span>
          </div>
        </div>

        <div className="bg-card p-5 border border-border rounded-lg">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">Revenue Gen</h3>
            <TrendingUp className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">$142k</span>
            <span className="text-[12px] font-medium text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 8.1%
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytical Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="bg-card border border-border rounded-lg p-5 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[14px] font-semibold text-foreground">Revenue vs Target</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[12px] text-secondary-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                Revenue
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-secondary-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary-foreground/30"></div>
                Target
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '13px' }}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="target" fill="#d1d5db" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-6">Traffic (Trailing 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
