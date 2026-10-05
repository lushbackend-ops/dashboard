"use client";

import { useState } from "react";
import { Download, Play, Copy, Trash, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function AIStudioLibrary() {
  const [content] = useState([
    { id: 1, title: "UAE Cashew Importers Reel", product: "Cashews", platform: "Instagram Reel", template: "Lead Generation", date: "2026-10-05", status: "Ready", thumbnail: "https://images.unsplash.com/photo-1599818815152-cb6bb46d2745?w=200&h=300&fit=crop" },
    { id: 2, title: "Global Spices Promo", product: "Spices", platform: "LinkedIn Video", template: "Product Showcase", date: "2026-10-04", status: "Published", thumbnail: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=300&fit=crop" }
  ]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Content Library</h1>
          <p className="text-[14px] text-secondary-foreground mt-1">Manage your AI-generated videos and assets.</p>
        </div>
        <Link href="/ai-studio" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition">
          Create New Content
        </Link>
      </div>

      <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/20 border-b border-border text-secondary-foreground">
            <tr>
              <th className="p-4 font-medium">Content</th>
              <th className="p-4 font-medium">Platform</th>
              <th className="p-4 font-medium">Template</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {content.map((item) => (
              <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <img src={item.thumbnail} alt={item.title} className="w-10 h-14 object-cover rounded shadow-sm border border-border/50" />
                    <div>
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-secondary-foreground">{item.product}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-secondary-foreground">{item.platform}</td>
                <td className="p-4 text-secondary-foreground">{item.template}</td>
                <td className="p-4 text-secondary-foreground">{item.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md border ${item.status === 'Ready' ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-secondary-foreground">
                    <button className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Preview"><Play className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:text-foreground hover:bg-secondary rounded transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:text-foreground hover:bg-secondary rounded transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title="Delete"><Trash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
