"use client";
import { useActionState } from "react";
import { simulateWebsiteEnquiry } from "./actions";

export default function WebsiteAI() {
  const [state, formAction, isPending] = useActionState(simulateWebsiteEnquiry, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Website AI Assistant</h1>
      <div className="bg-card p-6 rounded-xl border border-border">
        <p className="text-secondary-foreground text-sm mb-4">
          Test the behavior of the public-facing website AI.
        </p>
        <form action={formAction} className="flex gap-2">
          <input name="query" required type="text" placeholder="e.g. What is the MOQ for raw cashew nuts?" className="flex-1 border border-border rounded-md p-2 bg-transparent" />
          <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
            {isPending ? "Testing..." : "Test Enquiry"}
          </button>
        </form>

        {state?.result && (
          <div className="mt-6 w-full text-left bg-black/20 p-4 rounded-md">
            <h3 className="font-semibold mb-2">AI Response:</h3>
            <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
              {state.result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
