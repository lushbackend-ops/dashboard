"use client";
import { useActionState, useState, useEffect } from "react";
import { findLeads, saveLeadToCRM, getSuggestedLeads } from "./actions";
import { Plus, X, Building, Mail, Phone, Box, MapPin, Loader2 } from "lucide-react";

export default function LeadFinder() {
  const [state, formAction, isPending] = useActionState(findLeads, null);
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());
  const [discardedLeads, setDiscardedLeads] = useState<Set<string>>(new Set());
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [suggestedLeads, setSuggestedLeads] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      const leads = await getSuggestedLeads();
      if (leads) {
        setSuggestedLeads(leads);
      } else {
        setSuggestedLeads(FALLBACK_LEADS);
      }
      setLoadingSuggestions(false);
    }
    loadSuggestions();
  }, []);

  const handleSave = async (lead: any, index: number, isSuggested = false) => {
    const key = `${lead.company_name}-${index}${isSuggested ? '-sug' : ''}`;
    setSavingKeys(prev => new Set(prev).add(key)); // Instant visual feedback
    await saveLeadToCRM(lead);
    setSavedLeads(new Set(savedLeads).add(key));
    setSavingKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleDiscard = (lead: any, index: number, isSuggested = false) => {
    const key = `${lead.company_name}-${index}${isSuggested ? '-sug' : ''}`;
    setDiscardedLeads(new Set(discardedLeads).add(key));
  };

  const FALLBACK_LEADS = [
    {
      company_name: "FreshFoods Wholesale",
      location: "San Francisco, CA, USA",
      contact_email: "buyer@freshfoodswholesale.com",
      phone: "+1 800 555 1234",
      product: "Organic Cashews",
      message: "Interested in setting up a quarterly contract for bulk organic cashew nuts."
    },
    {
      company_name: "Global Tech Logistics",
      location: "London, UK",
      contact_email: "supply@gtlogistics.co",
      phone: "+44 20 7123 4567",
      product: "Warehouse Machinery",
      message: "Seeking new vendors for our European distribution centers."
    },
    {
      company_name: "Apex Manufacturing Solutions",
      location: "Berlin, Germany",
      contact_email: "procurement@apex-mfg.de",
      phone: "+49 30 9876 5432",
      product: "Industrial Sensors",
      message: "Looking for reliable suppliers of high-precision temperature sensors."
    }
  ];

  const leadsToDisplay = state?.leads && state.leads.length > 0 ? state.leads : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Lead Finder</h1>
      <div className="bg-card p-6 rounded-xl border border-border">
        <p className="text-secondary-foreground text-sm">
          Discover potential B2B buyers in target markets using our AI Lead Generator.
        </p>
        <form action={formAction} className="mt-4 flex flex-col sm:flex-row gap-2">
          <select name="category" className="border border-border rounded-md p-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="Agriculture & Farming">Agriculture & Farming</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
            <option value="Technology & SaaS">Technology & SaaS</option>
            <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
            <option value="Retail & Wholesale">Retail & Wholesale</option>
            <option value="Healthcare & Medical">Healthcare & Medical</option>
            <option value="Other">Other</option>
          </select>
          <input name="query" required type="text" placeholder="e.g. Cashew processors in Vietnam" className="flex-1 border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-5 py-2 rounded-md font-medium disabled:opacity-50 whitespace-nowrap active:scale-95 transition-all hover:bg-primary/90">
            {isPending ? "Generating..." : "Find Leads"}
          </button>
        </form>
        {state?.error && (
          <p className="text-destructive mt-3 text-sm">{state.error}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          {leadsToDisplay ? "Discovered Leads:" : "Suggested Potential Leads:"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!leadsToDisplay && loadingSuggestions ? (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-secondary-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Generating AI suggestions...</p>
            </div>
          ) : (leadsToDisplay || suggestedLeads).map((lead: any, index: number) => {
            const isSuggested = !leadsToDisplay;
            const key = `${lead.company_name}-${index}${isSuggested ? '-sug' : ''}`;
            if (discardedLeads.has(key)) return null;
            
            const isSaved = savedLeads.has(key);
            const isSaving = savingKeys.has(key);

            return (
              <div key={key} className={`bg-card p-5 rounded-xl border ${isSaved ? 'border-success bg-success/5' : 'border-border'} transition-colors relative`}>
                {isSuggested && !isSaved && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-border shadow-sm">
                    Suggested
                  </span>
                )}
                <div className="mb-4 mt-1">
                  <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    {lead.company_name}
                  </h4>
                  <div className="mt-2 space-y-1.5 text-sm text-secondary-foreground">
                    {lead.location && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {lead.location}</p>}
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {lead.contact_email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {lead.phone}</p>
                    <p className="flex items-center gap-2"><Box className="w-3.5 h-3.5" /> {lead.product}</p>
                    <p className="italic mt-2 text-[13px] bg-background p-2 rounded border border-border">"{lead.message}"</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isSaved ? (
                    <button disabled className="flex-1 bg-success/20 text-success py-2 rounded-md font-medium flex items-center justify-center gap-2 text-sm">
                      Added to CRM
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleSave(lead, index, isSuggested)}
                        disabled={isSaving}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-medium flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all disabled:opacity-70"
                      >
                        {isSaving ? (
                          "Adding..."
                        ) : (
                          <><Plus className="w-4 h-4" /> Add to CRM</>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDiscard(lead, index, isSuggested)}
                        disabled={isSaving}
                        className="px-3 bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive py-2 rounded-md font-medium flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                        title="Discard"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
