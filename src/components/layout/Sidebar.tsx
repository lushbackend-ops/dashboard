"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  PenTool,
  Video,
  Globe2,
  Users,
  Megaphone,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Brain", href: "/brain", icon: BrainCircuit },
    { name: "Content Studio", href: "/content", icon: PenTool },
    { name: "Creative Studio", href: "/creative", icon: Video },
    { name: "Market Intelligence", href: "/research", icon: Globe2 },
    { name: "Lead Finder", href: "/leads/finder", icon: Users },
    { name: "CRM & Scoring", href: "/crm", icon: Users },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Outreach", href: "/outreach", icon: MessageSquare },
    { name: "Website AI", href: "/website-ai", icon: BrainCircuit },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="hidden lg:flex lg:flex-col w-[260px] bg-white border-r border-border h-full">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <div className="text-base font-semibold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs">
            L
          </div>
          Lush Trade Corp
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-0.5 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            // Check if active (exact match for home, startsWith for others)
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive 
                    ? "bg-accent text-accent-foreground border-l-2 border-primary"
                    : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-secondary-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-secondary-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4 text-secondary-foreground" />
          Settings
        </Link>
      </div>
    </div>
  );
}
