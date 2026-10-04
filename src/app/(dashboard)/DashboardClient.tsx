"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { Users, Globe2, MessageSquare, ArrowUpRight, Bot, Share2 } from "lucide-react";

export function DashboardClient({ leads }: { leads: any[] }) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("30");

  // Parse the source from the message string
  const parsedLeads = leads.map(lead => {
    let source = "Website Form";
    let cleanMessage = lead.message || "";

    const sourceMatch = cleanMessage.match(/^\[Source: (.*?)\]/);
    if (sourceMatch) {
      source = sourceMatch[1];
      cleanMessage = cleanMessage.replace(sourceMatch[0], "").trim();
    }

    return { ...lead, source, cleanMessage };
  });

  // Filter leads by time range for the charts
  const filteredLeads = parsedLeads.filter(l => {
    if (timeRange === "all") return true;
    const days = parseInt(timeRange);
    const date = new Date(l.created_at);
    const diff = (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diff <= days;
  });

  // Aggregate real data
  const totalLeads = parsedLeads.length;
  const websiteLeads = parsedLeads.filter(l => l.source === "Website Form").length;
  const socialLeads = parsedLeads.filter(l => l.source === "Social Lead Finder").length;
  const aiLeads = parsedLeads.filter(l => l.source === "AI Lead Finder").length;

  // Calculate Leads Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = parsedLeads.filter(l => new Date(l.created_at) >= today).length;

  // Group leads by Date & Source for the Area Chart
  const leadsByDate = filteredLeads.reduce((acc, lead) => {
    const date = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = { date, "Website Form": 0, "AI Lead Finder": 0, "Social Lead Finder": 0 };
    }
    acc[date][lead.source as keyof typeof acc[string]] = ((acc[date][lead.source as keyof typeof acc[string]] as number) || 0) + 1;
    return acc;
  }, {} as Record<string, any>);

  const timelineData = Object.values(leadsByDate).reverse();

  // If there's only one data point or no data points, inject some placeholder dates just to make the chart look like a timeline
  if (timelineData.length === 1) {
    timelineData.unshift({ date: "Yesterday", "Website Form": 0, "AI Lead Finder": 0, "Social Lead Finder": 0 });
  }

  // Data for the Pie Chart
  const pieData = [
    { name: "Website", value: filteredLeads.filter(l => l.source === "Website Form").length, color: "#3b82f6" },
    { name: "AI Finder", value: filteredLeads.filter(l => l.source === "AI Lead Finder").length, color: "#22c55e" },
    { name: "Social Finder", value: filteredLeads.filter(l => l.source === "Social Lead Finder").length, color: "#06b6d4" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Global Command Center</h1>
          <p className="text-[14px] text-secondary-foreground mt-1">Real-time leads from website, AI, and social channels.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card p-6 border border-border rounded-[24px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-secondary-foreground">Total Leads</h3>
            <Users className="w-5 h-5 text-secondary-foreground/60" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground tracking-tight">{totalLeads}</span>
            {totalLeads > 0 && <span className="text-[13px] font-medium text-success flex items-center bg-success/10 px-2 py-1 rounded-full border border-success/20">Live Data</span>}
          </div>
        </div>

        <div className="bg-card p-6 border border-border rounded-[24px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-secondary-foreground">Leads Today</h3>
            <ArrowUpRight className="w-5 h-5 text-secondary-foreground/60" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground tracking-tight">{leadsToday}</span>
            <span className="text-[13px] text-secondary-foreground">New today</span>
          </div>
        </div>

        <div className="p-6 border border-blue-500/20 rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(59,130,246,0.2)] bg-gradient-to-br from-blue-500 to-blue-900 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-white/80">Website </h3>
            <Globe2 className="w-5 h-5 text-white" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">{websiteLeads}</span>
            <span className="text-[13px] text-white/70">Organic</span>
          </div>
        </div>

        <div className="p-6 border border-green-500/20 rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(34,197,94,0.2)] bg-gradient-to-br from-green-500 to-green-900 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-white/80">AI Lead Finder</h3>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">{aiLeads}</span>
            <span className="text-[13px] text-white/70">Generated</span>
          </div>
        </div>
        
        <div className="p-6 border border-cyan-500/20 rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(6,182,212,0.2)] bg-gradient-to-br from-cyan-500 to-cyan-900 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-white/80">Social Media</h3>
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">{socialLeads}</span>
            <span className="text-[13px] text-white/70">Generated</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-8 w-full">
        {/* Real Leads Table */}
        <div className="bg-card border border-border rounded-[24px] p-6 w-full overflow-hidden shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6 tracking-tight">Latest Inbound Leads</h2>
          {parsedLeads.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-secondary-foreground border border-dashed border-border rounded-xl bg-secondary/30">
              No real leads found in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-border text-secondary-foreground">
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedLeads.map((lead) => (
                    <React.Fragment key={lead.id}>
                      <tr
                        className="hover:bg-secondary/40 transition-colors group cursor-pointer"
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      >
                        <td className="py-4 font-medium flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-secondary-foreground transition-transform ${expandedLead === lead.id ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6" /></svg>
                          {lead.company_name}
                        </td>
                        <td className="py-4 text-secondary-foreground">{lead.contact_email || "N/A"}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-[12px] rounded-md border border-border inline-block">
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-[12px] font-medium rounded-md border border-primary/20">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.contact_email && (
                            <a
                              href={`mailto:${lead.contact_email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-secondary-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="Send Email"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </a>
                          )}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { updateLeadStatus } = await import("./actions");
                              await updateLeadStatus(lead.id, "Contacted");
                            }}
                            className="p-2 text-secondary-foreground hover:text-success hover:bg-success/10 rounded-md transition-colors"
                            title="Mark as Contacted"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { updateLeadStatus } = await import("./actions");
                              await updateLeadStatus(lead.id, "Qualified");
                            }}
                            className="p-2 text-secondary-foreground hover:text-warning hover:bg-warning/10 rounded-md transition-colors"
                            title="Mark as Qualified"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this lead?")) {
                                const { deleteLead } = await import("./actions");
                                await deleteLead(lead.id);
                              }
                            }}
                            className="p-2 text-secondary-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Delete Lead"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </button>
                        </td>
                      </tr>
                      {expandedLead === lead.id && (
                        <tr className="bg-secondary/10">
                          <td colSpan={5} className="p-6 border-l-4 border-primary">
                            <div className="grid grid-cols-2 gap-6 text-[14px]">
                              <div>
                                <p className="text-secondary-foreground text-[12px] font-semibold uppercase tracking-wider mb-2">Phone Number</p>
                                <p className="font-medium text-[15px]">{lead.phone || "Not provided"}</p>
                              </div>
                              <div>
                                <p className="text-secondary-foreground text-[12px] font-semibold uppercase tracking-wider mb-2">Product Interest</p>
                                <p className="font-medium text-[15px]">{lead.product || "Unknown"}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-secondary-foreground text-[12px] font-semibold uppercase tracking-wider mb-2">Message</p>
                                <p className="text-foreground/90 bg-background border border-border p-5 rounded-[12px] italic text-[15px] leading-relaxed shadow-sm">
                                  {lead.cleanMessage || "No message found."}
                                </p>
                              </div>
                              <div className="col-span-2 flex items-center justify-between mt-4 pt-4 border-t border-dashed border-border/50 text-secondary-foreground">
                                <span className="text-[12px] flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                  Received on: {new Date(lead.created_at).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-[24px] p-6 col-span-1 lg:col-span-2 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Lead Generation Velocity</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-secondary/50 border border-border text-xs rounded-md px-2 py-1 focus:outline-none"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center">
              {timelineData.length === 0 ? (
                <p className="text-sm text-secondary-foreground">No data to chart</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--secondary-foreground))', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--secondary-foreground))', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--secondary)/0.5)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="Website Form" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWeb)" />
                    <Area type="monotone" dataKey="AI Lead Finder" stackId="1" stroke="#22c55e" fillOpacity={1} fill="url(#colorAI)" />
                    <Area type="monotone" dataKey="Social Lead Finder" stackId="1" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSocial)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6 tracking-tight">Sources Breakdown</h2>
            <div className="h-[250px] w-full flex items-center justify-center relative">
              {pieData.length === 0 ? (
                <p className="text-sm text-secondary-foreground">No data to chart</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground">{filteredLeads.length}</span>
                    <span className="text-xs text-secondary-foreground">Leads</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
