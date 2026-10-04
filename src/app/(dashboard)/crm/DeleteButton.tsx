"use client";
import { Trash2 } from "lucide-react";
import { deleteLead } from "../actions";

export default function DeleteButton({ id }: { id: string }) {
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to permanently delete this lead?")) {
          await deleteLead(id);
        }
      }}
      className="p-1.5 text-secondary-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
      title="Delete Lead"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
