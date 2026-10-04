"use client";
import { useActionState } from "react";
import { performResearch } from "./actions";

export default function MarketIntelligence() {
  const [state, formAction, isPending] = useActionState(performResearch, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Market Intelligence</h1>
      <div className="bg-card p-6 rounded-xl border border-border">
        <p className="text-secondary-foreground text-sm">
          Search for market trends, country import data, and competitors.
        </p>
        <form action={formAction} className="mt-4 flex gap-2">
          <input name="query" required type="text" placeholder="e.g. India Cashew import trends 2026" className="flex-1 border border-border rounded-md p-2 bg-transparent" />
          <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
            {isPending ? "Researching..." : "Research"}
          </button>
        </form>
      </div>

      {state?.result && (
        <div className="bg-card p-6 rounded-xl border border-border mt-6">
          <h3 className="font-semibold mb-2">Research Findings:</h3>
          <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
            {state.result}
          </div>
        </div>
      )}
    </div>
  );
}
