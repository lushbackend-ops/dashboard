import { createClient } from "@/utils/supabase/server";
import { Mail, Phone, Box, Calendar } from "lucide-react";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function CRM() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error.message);
  }

  const allLeads = leads || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lead CRM</h1>
          <p className="text-secondary-foreground text-sm">Manage and track your incoming leads</p>
        </div>
      </div>
      
      {allLeads.length === 0 ? (
        <div className="bg-card p-12 rounded-xl border border-border flex flex-col items-center justify-center text-center">
          <p className="text-secondary-foreground">No leads yet. Connect your email to start receiving leads.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLeads.map((lead) => (
            <div key={lead.id} className="bg-card border border-border rounded-lg p-5 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-foreground truncate" title={lead.company_name}>
                  {lead.company_name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded border border-primary/20 shrink-0">
                    {lead.status || "New"}
                  </span>
                  <DeleteButton id={lead.id} />
                </div>
              </div>
              
              <div className="space-y-2 text-[13px] text-secondary-foreground flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lead.contact_email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{lead.phone || "No phone"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lead.product || "No product"}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border/50">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
