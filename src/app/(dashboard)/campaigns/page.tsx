"use client";
import { useActionState } from "react";
import { generateCampaignIdea } from "./actions";

export default function Campaigns() {
  const [state, formAction, isPending] = useActionState(generateCampaignIdea, null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border flex flex-col items-center justify-center min-h-96">
        <p className="text-secondary-foreground text-sm text-center mb-4">No active campaigns.</p>
        
        <form action={formAction} className="flex gap-2 w-full max-w-md">
          <input name="objective" required placeholder="Campaign objective..." className="flex-1 border border-border p-2 rounded-md bg-transparent" />
          <button disabled={isPending} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
            {isPending ? "Drafting..." : "Draft Idea"}
          </button>
        </form>

        {state?.result && (
          <div className="mt-6 w-full max-w-2xl text-left bg-black/20 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Campaign Idea:</h3>
            <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
              {state.result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
