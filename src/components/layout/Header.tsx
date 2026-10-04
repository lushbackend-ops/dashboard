import { Bell, Menu, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-secondary-foreground hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-secondary rounded-md text-secondary-foreground w-96">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search leads, campaigns, content..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary-foreground/70"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-secondary-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
          JD
        </div>
      </div>
    </header>
  );
}
