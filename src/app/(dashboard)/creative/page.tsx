"use client";
import { useActionState } from "react";
import { generateCreative } from "./actions";

export default function CreativeStudio() {
  const [state, formAction, isPending] = useActionState(generateCreative, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Creative & Reel Studio</h1>
      
      <form action={formAction} className="space-y-4 bg-card p-6 rounded-xl border border-border">
        <div>
          <label className="block text-sm font-medium mb-1">Concept / Product</label>
          <input name="concept" required className="w-full border border-border rounded-md p-2 bg-transparent" placeholder="e.g. Behind the scenes at Mtwara port" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Creative Type</label>
          <select name="type" className="w-full border border-border rounded-md p-2 bg-transparent">
            <option value="Reel Script">Reel Script</option>
            <option value="Storyboard">Storyboard</option>
            <option value="Creative Brief">Creative Brief</option>
          </select>
        </div>
        
        <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50">
          {isPending ? "Generating..." : "Generate"}
        </button>
      </form>

      {state?.result && (
        <div className="mt-6 bg-card w-full text-left p-6 rounded-xl border border-border">
          <h3 className="font-semibold mb-2">Creative Output:</h3>
          <div className="whitespace-pre-wrap text-sm text-secondary-foreground">
            {state.result}
          </div>
        </div>
      )}
    </div>
  );
}
