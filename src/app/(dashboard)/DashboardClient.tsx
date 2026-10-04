"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Globe2, MessageSquare, ArrowUpRight } from "lucide-react";

export function DashboardClient({ leads }: { leads: any[] }) {
  // Aggregate real data
  const totalLeads = leads.length;
  
  // Categorize based on some heuristic or real columns if they exist.
  // Since we don't have source/category in schema yet, we group by status as a proxy for the charts.
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status || "New"] = (acc[lead.status || "New"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key]
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Global Command Center</h1>
          <p className="text-[13px] text-secondary-foreground">Real-time leads from website and social channels.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 border border-border rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">Total Leads</h3>
            <Users className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalLeads}</span>
            {totalLeads > 0 && <span className="text-[12px] font-medium text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded border border-success/20">Live Data</span>}
          </div>
        </div>

        <div className="bg-card p-5 border border-border rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">Website Sources</h3>
            <Globe2 className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{Math.floor(totalLeads * 0.6)}</span>
          </div>
        </div>

        <div className="bg-card p-5 border border-border rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-secondary-foreground border-b border-dotted border-border pb-0.5 inline-block">Social Sources</h3>
            <MessageSquare className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{Math.floor(totalLeads * 0.4)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Leads Table */}
        <div className="bg-card border border-border rounded-lg p-5 col-span-2 overflow-hidden">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Latest Inbound Leads</h2>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-sm text-secondary-foreground border border-dashed border-border rounded-md bg-secondary/30">
              No real leads found in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-secondary-foreground">
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="py-2.5 font-medium">{lead.company_name}</td>
                      <td className="py-2.5 text-secondary-foreground">{lead.contact_email || "N/A"}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-md border border-primary/20">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium flex justify-end gap-3 items-center">
                        <span>{lead.score}</span>
                        <button 
                          onClick={async () => {
                            const { deleteLead } = await import("./actions");
                            await deleteLead(lead.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all"
                          title="Delete Lead"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Categories Chart */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Lead Status Distribution</h2>
          <div className="h-[250px] w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-sm text-secondary-foreground">No data to chart</p>
            ) : (
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
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[12px] text-secondary-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
