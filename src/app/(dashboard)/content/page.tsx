"use client";

import { useActionState } from "react";
import { generateContent } from "./actions";

export default function ContentStudio() {
  const [state, formAction, isPending] = useActionState(generateContent, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Content Studio</h1>
      
      <form action={formAction} className="space-y-4 bg-card p-6 rounded-xl border border-border">
        <div>
          <label className="block text-sm font-medium mb-1">Topic / Product</label>
          <input name="prompt" required className="w-full border border-border rounded-md p-2 bg-transparent" placeholder="e.g. Raw Cashew Nuts sourcing" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select name="platform" className="w-full border border-border rounded-md p-2 bg-transparent">
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
          </select>
        </div>
        
        <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
          {isPending ? "Generating..." : "Generate"}
        </button>
      </form>

      {state?.result && (
        <div className="bg-card p-6 rounded-xl border border-border mt-6">
          <h3 className="font-semibold mb-2">Generated Output:</h3>
          <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
            {state.result}
          </div>
        </div>
      )}
    </div>
  );
}
