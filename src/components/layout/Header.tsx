"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  Menu, 
  Search, 
  X,
  LayoutDashboard,
  BrainCircuit,
  Video,
  Globe2,
  Users,
  Megaphone,
  BarChart3,
  Settings
} from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Brain", href: "/brain", icon: BrainCircuit },
    { name: "Creative Studio", href: "/creative", icon: Video },
    { name: "Market Intelligence(coming soon)", href: "/research", icon: Globe2 },
    { name: "Lead Finder", href: "/leads/finder", icon: Users },
    { name: "CRM & Scoring", href: "/crm", icon: Users },
    { name: "Campaigns(coming soon)", href: "/campaigns", icon: Megaphone },
    { name: "Website AI(coming soon)", href: "/website-ai", icon: BrainCircuit },
    { name: "Analytics(coming soon)", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <>
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <button 
            className="lg:hidden text-secondary-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
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
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="text-secondary-foreground hover:text-foreground relative p-2 hover:bg-secondary/50 rounded-md transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm ml-2">
            JD
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-card pb-12 shadow-xl border-r border-border h-full">
            <div className="flex h-16 items-center justify-between px-6 border-b border-border">
              <div className="text-[15px] font-semibold text-foreground flex items-center gap-3 tracking-tight">
                <div className="w-7 h-7 bg-primary rounded-[8px] flex items-center justify-center text-primary-foreground text-xs shadow-sm shadow-primary/20">
                  L
                </div>
                Lush Trade Corp
              </div>
              <button 
                type="button" 
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-secondary-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {/* Mobile Search */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md text-secondary-foreground w-full">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary-foreground/70"
                />
              </div>
            </div>

            <div className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-secondary-foreground"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-border mt-auto">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium text-secondary-foreground hover:bg-secondary/60 hover:text-foreground transition-all duration-200"
              >
                <Settings className="w-4 h-4 text-secondary-foreground" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
