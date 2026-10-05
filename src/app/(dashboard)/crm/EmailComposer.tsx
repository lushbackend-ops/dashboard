"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

export function EmailComposer({ email, company }: { email: string; company: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API call to SMTP / Resend
    await new Promise(r => setTimeout(r, 1000));
    setIsSending(false);
    setSent(true);
    setTimeout(() => {
      setIsOpen(false);
      setSent(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-md font-medium text-[13px] hover:bg-primary/90 transition-colors mt-2"
      >
        Compose Email
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold text-foreground">New Message to {company}</h3>
          <button onClick={() => setIsOpen(false)} className="text-secondary-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {sent ? (
          <div className="p-12 text-center text-success font-medium flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            Email sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 space-y-4">
            <div>
              <label className="text-[12px] font-medium text-secondary-foreground mb-1 block">To:</label>
              <input type="email" readOnly value={email} className="w-full border border-border rounded-md p-2 text-sm bg-secondary/20 text-foreground outline-none" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-secondary-foreground mb-1 block">Subject:</label>
              <input type="text" required placeholder="Following up on your request..." className="w-full border border-border rounded-md p-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-secondary-foreground mb-1 block">Message:</label>
              <textarea required rows={5} placeholder="Write your message here..." className="w-full border border-border rounded-md p-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={isSending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
              >
                {isSending ? "Sending..." : <><Send className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
