"use client";
import { useActionState } from "react";
import { scoreLead } from "./actions";

export default function CRM() {
  const [state, formAction, isPending] = useActionState(scoreLead, null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">CRM & Leads</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">Add Lead</button>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border flex flex-col items-center justify-center min-h-96">
        <p className="text-secondary-foreground mb-4">No leads yet. Use the Lead Finder to discover buyers.</p>
        
        <form action={formAction} className="flex gap-2">
          <input name="lead" placeholder="Test lead data..." className="border border-border p-2 rounded-md bg-transparent" />
          <button disabled={isPending} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md disabled:opacity-50">
            {isPending ? "Scoring..." : "Test AI Scoring"}
          </button>
        </form>
        
        {state?.result && (
          <div className="mt-6 w-full max-w-2xl text-left bg-black/20 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Score Result:</h3>
            <pre className="whitespace-pre-wrap text-sm text-secondary-foreground">
              {state.result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
