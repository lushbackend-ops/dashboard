"use client";
import { useActionState } from "react";
import { draftOutreach } from "./actions";

export default function Outreach() {
  const [state, formAction, isPending] = useActionState(draftOutreach, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Outreach Assistant</h1>
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="font-medium mb-4">Pending Approvals</h3>
        <p className="text-secondary-foreground text-sm mb-6">No outreach drafts pending your approval.</p>
        
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="font-medium mb-4">Draft New Message</h3>
          <form action={formAction} className="flex gap-2">
            <input name="context" required placeholder="Lead context... e.g. Met at Gulfood" className="flex-1 border border-border p-2 rounded-md bg-transparent" />
            <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
              {isPending ? "Drafting..." : "Generate Draft"}
            </button>
          </form>
        </div>

        {state?.result && (
          <div className="mt-6 w-full text-left bg-black/20 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Draft:</h3>
            <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
              {state.result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
