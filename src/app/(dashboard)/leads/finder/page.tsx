"use client";
import { useActionState } from "react";
import { findLeads } from "./actions";

export default function LeadFinder() {
  const [state, formAction, isPending] = useActionState(findLeads, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Lead Finder</h1>
      <div className="bg-card p-6 rounded-xl border border-border">
        <p className="text-secondary-foreground text-sm">
          Discover potential B2B buyers in target markets.
        </p>
        <form action={formAction} className="mt-4 flex gap-2">
          <input name="query" required type="text" placeholder="e.g. Cashew processors in Vietnam" className="flex-1 border border-border rounded-md p-2 bg-transparent" />
          <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
            {isPending ? "Searching..." : "Find Leads"}
          </button>
        </form>
      </div>

      {state?.result && (
        <div className="bg-card p-6 rounded-xl border border-border mt-6">
          <h3 className="font-semibold mb-2">Lead Results:</h3>
          <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
            {state.result}
          </div>
        </div>
      )}
    </div>
  );
}
