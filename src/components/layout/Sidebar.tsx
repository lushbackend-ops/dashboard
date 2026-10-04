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
    <div className="hidden lg:flex lg:flex-col w-[260px] bg-background/80 backdrop-blur-xl border-r border-border/40 h-full relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <div className="text-[15px] font-semibold text-foreground flex items-center gap-3 tracking-tight">
          <div className="w-7 h-7 bg-primary rounded-[8px] flex items-center justify-center text-primary-foreground text-xs shadow-sm shadow-primary/20">
            L
          </div>
          Lush Trade Corp
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
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
        </nav>
      </div>
      <div className="p-4 border-t border-border/40">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium text-secondary-foreground hover:bg-secondary/60 hover:text-foreground transition-all duration-200"
        >
          <Settings className="w-4 h-4 text-secondary-foreground" />
          Settings
        </Link>
      </div>
    </div>
  );
}
