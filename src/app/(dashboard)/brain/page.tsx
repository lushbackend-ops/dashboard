import Link from "next/link";
import { FileText, Building2, Package, CheckCircle } from "lucide-react";

export default function AIBrainPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Business Brain</h1>
        <p className="text-secondary-foreground mt-1 text-sm">
          Manage the verified knowledge the AI uses to generate content and recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/brain/company" className="block bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-medium">Company Profile</h3>
          <p className="text-sm text-secondary-foreground mt-1">Mission, vision, and core positioning.</p>
        </Link>

        <Link href="/brain/products" className="block bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-medium">Products</h3>
          <p className="text-sm text-secondary-foreground mt-1">Manage commodities, specs, and MOQs.</p>
        </Link>

        <Link href="/brain/claims" className="block bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-medium">Approved Claims</h3>
          <p className="text-sm text-secondary-foreground mt-1">Certifications and legal marketing statements.</p>
        </Link>

        <Link href="/brain/knowledge" className="block bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-medium">Knowledge Base</h3>
          <p className="text-sm text-secondary-foreground mt-1">Upload documents and FAQs for the AI.</p>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">System Status</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">AI Provider Configuration</p>
              <p className="text-xs text-secondary-foreground">LLM used for generation</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Not Configured
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">Vector Database (pgvector)</p>
              <p className="text-xs text-secondary-foreground">Required for context retrieval</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Pending Schema
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
